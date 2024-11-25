import { IconButton } from '../ui/IconButton'
import git from 'isomorphic-git' 
import http from 'isomorphic-git/http/web'
import { useGit } from '~/lib/hooks/useGit'

export default function GitCloneButton() {
    const {ready,gitClone} = useGit()
    const onClick=  async(e:any)=>{
        if (!ready) return
        let repoUrl=prompt("Enter the Git url")
        if (repoUrl) {
            await gitClone(repoUrl)
        }
    }
  return (
    <IconButton onClick={e=>{
        onClick(e)
        
    }} className="w-full justify-center" title="Clone A Git Repo">
        <span className="mr-2 text-xs lg:text-sm">Clone A Git Repo</span>
        <div className='i-ph:git-branch' />
    </IconButton>
  )
}
