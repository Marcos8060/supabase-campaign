// components/features/campaign/taxonomy/TaxonomyForm.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/app/lib/supabase/client"

const taxonomyTypes = ["platform", "industry", "objective", "channel", "audience"]

interface TaxonomyFormProps {
  onAdd?: () => void;
}

const TaxonomyForm = ({ onAdd = () => {} }: TaxonomyFormProps) => {
  const [type, setType] = useState("platform")
  const [value, setValue] = useState("")

  const handleSubmit = async () => {
    if (!value.trim()) return toast.error("Value cannot be empty")
    
    const { error } = await supabase.from("taxonomy").insert([{ type, value }])
    if (error) {
      toast.error("Failed to add entry")
    } else {
      toast.success("Entry added")
      setValue("")
      onAdd()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded-md"
        >
          {taxonomyTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <Input
          placeholder="New value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={handleSubmit}>Add</Button>
      </div>
    </div>
  )
}

export default TaxonomyForm;