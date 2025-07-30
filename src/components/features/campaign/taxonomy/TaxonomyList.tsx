"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase/client";

export type TaxonomyItem = {
  id: string;
  type: string;
  value: string;
};

const TaxonomyList = () => {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaxonomy = async () => {
      const { data, error } = await supabase
        .from("taxonomy")
        .select("id,type,value");

      if (error) {
        console.error("Error fetching taxonomy:", error);
      } else {
        setItems(data);
      }
      setLoading(false);
    };

    fetchTaxonomy();
  }, []);

  if (loading) return <p>Loading taxonomy...</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Taxonomy Items</h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="text-sm">
            <span className="font-medium text-blue-600">{item.type}</span>:{" "}
            {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaxonomyList;
