import { useState } from 'react';
import Cookies from 'js-cookie';
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Input_api() {
  const [selectedModel, setSelectedModel] = useState(() => Cookies.get('model') || "gpt-3.5-turbo");
  const [apiKey, setApiKey] = useState(() => Cookies.get('apiKey') || "");
  const [loading, setLoading] = useState(false);

  const save = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    Cookies.set('model', selectedModel);
    Cookies.set('apiKey', apiKey);
    setLoading(true);
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    setLoading(false);
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
    setLoading(false);
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Select value={selectedModel} onValueChange={handleModelChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
          <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
        </SelectContent>
      </Select>
      <Input placeholder=" Input your OpenAI API Key" value={apiKey} onChange={handleApiKeyChange} type="password" />
      <Button variant="ghost" type="submit" onClick={save} disabled={loading}> {loading ? "Saved" : "Save"}</Button>
    </div>
  )
}