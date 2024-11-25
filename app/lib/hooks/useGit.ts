import type { WebContainer,FileSystemAPI } from "@webcontainer/api";
import { useCallback, useEffect, useState } from "react";
import { webcontainer as webcontainerPromise } from "~/lib/webcontainer";
import git, { type PromiseFsClient } from 'isomorphic-git' 
import http from 'isomorphic-git/http/web'
import Cookies from 'js-cookie';




export function useGit() {
    const [ready, setReady] = useState(false);
    const [webcontainer, setWebcontainer] = useState<WebContainer>();
    const [fs, setFs] = useState<PromiseFsClient>();
    const lookupSavedPassword=(url:string)=>{
        try {

            // Save updated API keys to cookies with 30 day expiry and secure settings
            let creds=Cookies.get(`git:${url}`);  

            if (creds) {
                const parsedCreds = JSON.parse(creds);

                if (typeof parsedCreds === 'object' && parsedCreds !== null) {
                    return parsedCreds
                }
            }
            return;

        } catch (error) {
            console.error('Error saving API keys to cookies:', error);
            return;
        }
    }
    useEffect(()=>{
        webcontainerPromise.then(container=>{
            setWebcontainer(container);
            setFs(getFs(container));
            setReady(true);
        })
    },[])

    const gitClone= useCallback(async (url:string)=>{
        if (!webcontainer||!fs||!ready) {
            return;
        }
        let repo = await git.clone({
            fs,
            http,
            dir: webcontainer.workdir,
            url: url,
            depth: 1,
            singleBranch: true,
            corsProxy: 'https://cors.isomorphic-git.org',
            onAuth: url => {
                let auth = lookupSavedPassword(url)
                if (auth) return auth

                if (confirm('This repo is password protected. Ready to enter a username & password?')) {
                    auth = {
                        username: prompt('Enter username'),
                        password: prompt('Enter password'),
                    }
                    return auth
                } else {
                    return { cancel: true }
                }
            }
        })
        console.log(repo)
    }, [webcontainer])
    return {ready,gitClone}
}


interface IFS{
    promises:{
        readFile: PromiseFsClient['promises']['readFile'];
        writeFile: PromiseFsClient['promises']['writeFile'];
        mkdir:FileSystemAPI['mkdir'];
        readdir:FileSystemAPI['readdir'];
        rm:FileSystemAPI['rm'];
        unlink(path: string): Promise<void>;
        stat(path: string): Promise<any>;
        lstat(path: string): Promise<any>;
        rmdir(path: string): Promise<void>;
        readlink?(path: string): Promise<string>;
        symlink?(target: string, path: string): Promise<void>;
        chmod?(path: string, mode: number): Promise<void>;
    }
}
const getFs: (c: WebContainer) => PromiseFsClient = (webcontainer: WebContainer)=> ({
    promises:{
        readFile: async (path: string, options: any) => {
            let encoding = options.encoding;
            let relativePath = pathUtils.relative(webcontainer.workdir,path);
            console.log('readFile', relativePath, encoding);
            return await webcontainer.fs.readFile(relativePath,encoding);
        }, 
        writeFile: async (path: string, data: any, options: any) => {
            let encoding = options.encoding;
            let relativePath = pathUtils.relative(webcontainer.workdir,path);
            console.log('writeFile', {relativePath,data,encoding});
            return await webcontainer.fs.writeFile(relativePath, data, { ...options,encoding}); 
        },
        mkdir: async (path: string, options: any) => {
            let relativePath = pathUtils.relative(webcontainer.workdir, path);
            console.log('mkdir', relativePath,options);
            return await webcontainer.fs.mkdir(relativePath,{...options,recursive:true})
        },
        readdir: async (path: string,options:any) => {
            let relativePath = pathUtils.relative(webcontainer.workdir, path);
            console.log('readdir', relativePath,options);
            return await webcontainer.fs.readdir(relativePath,options)
        },
        rm: async (path: string,options:any) => {
            
            let relativePath = pathUtils.relative(webcontainer.workdir, path);
            console.log('rm', relativePath,options);

            return await webcontainer.fs.rm(relativePath, { ...options||{} })
        }, 
        rmdir: async (path: string,options:any) => {
            let relativePath = pathUtils.relative(webcontainer.workdir, path);
            console.log('rmdir', relativePath, options);
            return await webcontainer.fs.rm(relativePath, { recursive: true,...options})
        },
        
        // Mock implementations for missing functions
        unlink: async (path: string) => {
            // unlink is just removing a single file
            let relativePath = pathUtils.relative(webcontainer.workdir, path);
            return await webcontainer.fs.rm(relativePath, { recursive: false });
        },

        stat: async (path: string) => {
            try {
                let relativePath = pathUtils.relative(webcontainer.workdir, path);
                let resp = await webcontainer.fs.readdir(pathUtils.dirname(relativePath),{withFileTypes:true})   
                let name = pathUtils.basename(relativePath)
                let fileInfo=resp.find(x=>x.name==name) 
                if(!fileInfo){
                    throw new Error(`ENOENT: no such file or directory, stat '${path}'`);
                }
                return {
                    isFile: () => fileInfo.isFile(),
                    isDirectory: () => fileInfo.isDirectory(),
                    isSymbolicLink: () => false,
                    size:  1,
                    mode: 0o666, // Default permissions
                    mtimeMs: Date.now(),
                    uid: 1000,
                    gid: 1000
                };
            } catch (error) {
                const err = new Error(`ENOENT: no such file or directory, stat '${path}'`) as NodeJS.ErrnoException;
                err.code = 'ENOENT';
                err.errno = -2;
                err.syscall = 'stat';
                err.path = path;
                throw err;
            }
        },

        lstat: async (path: string) => {
            // For basic usage, lstat can return the same as stat
            // since we're not handling symbolic links
            return await getFs(webcontainer).promises.stat(path);
        },

        readlink: async (path: string) => {
            // Since WebContainer doesn't support symlinks,
            // we'll throw a "not a symbolic link" error
            throw new Error(`EINVAL: invalid argument, readlink '${path}'`);
        },

        symlink: async (target: string, path: string) => {
            // Since WebContainer doesn't support symlinks,
            // we'll throw a "operation not supported" error
            throw new Error(`EPERM: operation not permitted, symlink '${target}' -> '${path}'`);
        },

        chmod: async (path: string, mode: number) => {
            // WebContainer doesn't support changing permissions,
            // but we can pretend it succeeded for compatibility
            return await Promise.resolve();
        }
        }
    })

const pathUtils = {
    dirname: (path: string) => {
        // Handle empty or just filename cases
        if (!path || !path.includes('/')) return '.';

        // Remove trailing slashes
        path = path.replace(/\/+$/, '');

        // Get directory part
        return path.split('/').slice(0, -1).join('/') || '/';
    },

    basename: (path: string, ext?: string) => {
        // Remove trailing slashes
        path = path.replace(/\/+$/, '');

        // Get the last part of the path
        const base = path.split('/').pop() || '';

        // If extension is provided, remove it from the result
        if (ext && base.endsWith(ext)) {
            return base.slice(0, -ext.length);
        }

        return base;
    },
    relative: (from: string, to: string): string => {
        // Handle empty inputs
        if (!from || !to) return '.';

        // Normalize paths by removing trailing slashes and splitting
        const normalizePathParts = (p: string) =>
            p.replace(/\/+$/, '')
                .split('/')
                .filter(Boolean);

        const fromParts = normalizePathParts(from);
        const toParts = normalizePathParts(to);

        // Find common parts at the start of both paths
        let commonLength = 0;
        const minLength = Math.min(fromParts.length, toParts.length);

        for (let i = 0; i < minLength; i++) {
            if (fromParts[i] !== toParts[i]) break;
            commonLength++;
        }

        // Calculate the number of "../" needed
        const upCount = fromParts.length - commonLength;

        // Get the remaining path parts we need to append
        const remainingPath = toParts.slice(commonLength);

        // Construct the relative path
        const relativeParts = [
            ...Array(upCount).fill('..'),
            ...remainingPath
        ];

        // Handle empty result case
        return relativeParts.length === 0 ? '.' : relativeParts.join('/');
    }
}