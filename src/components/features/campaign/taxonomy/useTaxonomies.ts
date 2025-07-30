'use client'
import { supabase } from "@/app/lib/supabase/client"
import { useState,useEffect } from "react"


export type TaxonomyItem = {
  id: number;
  category: string;
  value: string;
};

export const useTaxonomies = () => {
    const [data, setData] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);


  const fetch = async() => {
    const { data,error } = await supabase.from('taxonomy').select('*').order('category', { ascending: true})

    if(!error && data){
        setData(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch();
  }, []);

  return{
    data,
    loading,
    refetch: fetch
  }
}