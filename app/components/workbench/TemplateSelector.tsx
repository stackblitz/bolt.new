import { memo } from 'react';
import { templates, type TemplateName } from '~/utils/templates';
import { Select } from '~/components/ui/Select';

interface TemplateSelectorProps {
  className?: string;
  value: TemplateName;
  onChange: (templateName: TemplateName) => void;
}

export const TemplateSelector = memo(({ className, value, onChange }: TemplateSelectorProps) => {
  return (
    <Select
      options={Object.entries(templates).map(([key, value]) => ({ value: key, label: value.name }))}
      value={value}
      onChange={(newValue) => onChange(newValue as TemplateName)}
      className={className}
      placeholder="选择模板"
    />
  );
});
