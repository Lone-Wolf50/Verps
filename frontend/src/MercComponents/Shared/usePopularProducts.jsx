/**
 * usePopularProducts.js
 *
 * Fetches the set of product IDs that qualify as "popular" from the
 * verp_popular_products view (created by verp_ads_update.sql).
 *
 * A product is popular when:
 *   - Ordered 5+ times AND
 *   - Has accepted reviews averaging 4.0★ or above
 *     (or has no reviews yet but meets the order threshold)
 *
 * Returns a Set of product IDs for O(1) lookup.
 *
 * Usage:
 *   const popularIds = usePopularProducts();
 *   const isPopular = popularIds.has(product.id);
 */

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

let _cache = null;          // module-level cache — fetched once per session
let _fetching = false;
let _listeners = [];

const usePopularProducts = () => {
  const [popularIds, setPopularIds] = useState(_cache || new Set());

  useEffect(() => {
    if (_cache) { setPopularIds(_cache); return; }

    /* register this component as a listener */
    _listeners.push(setPopularIds);

    /* only one fetch fires even if multiple components mount simultaneously */
    if (!_fetching) {
      _fetching = true;
      supabase
        .from("verp_popular_products")
        .select("id")
        .then(({ data }) => {
          const ids = new Set((data || []).map((r) => r.id));
          _cache = ids;
          _listeners.forEach((fn) => fn(ids));
          _listeners = [];
          _fetching = false;
        });
    }

    return () => {
      _listeners = _listeners.filter((fn) => fn !== setPopularIds);
    };
  }, []);

  return popularIds;
};

export default usePopularProducts;