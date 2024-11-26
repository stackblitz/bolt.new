import React from 'react';
import { useStore } from '@nanostores/react';
import { providerStore, setProvider, type Provider } from '~/lib/stores/provider';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import '~/styles/index.scss';
import { ChevronUpIcon } from 'lucide-react';

export function ProviderSelector() {
  const currentProvider = useStore(providerStore);

  const handleProviderChange = (value: string) => {
    if (value === 'anthropic') {
      setProvider('anthropic');
    } else {
      setProvider({ type: 'together', model: value });
    }
  };

  const togetherModels = [
    'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
    'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'deepseek-ai/deepseek-llm-67b-chat',
    'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
    'google/gemma-2-27b-it',
    'databricks/dbrx-instruct',
    
    // Add more Together AI models here
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-auto justify-start gap-1 max-w-[250px] bg-transparent border-none ring-transparent outline-transparent text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary/80 truncate">
          {currentProvider === 'anthropic' 
            ? 'Sonnet 3.5' 
            : `Together AI (${currentProvider.model})`
          }
            <ChevronUpIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px] max-h-[50vh] overflow-y-auto bg-[#141414] text-white border border-bolt-elements-borderColor">
        <DropdownMenuRadioGroup 
          value={currentProvider === 'anthropic' ? 'anthropic' : currentProvider.model} 
          onValueChange={handleProviderChange}
        >
          <DropdownMenuRadioItem value="anthropic" className="hover:bg-white/10">
            Anthropic (Claude)
          </DropdownMenuRadioItem>
          {togetherModels.map(model => (
            <DropdownMenuRadioItem key={model} value={model} className="hover:bg-white/10">
              Together AI ({model})
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
