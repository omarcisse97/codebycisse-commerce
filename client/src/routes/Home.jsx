import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import ProductCard from "../components/ProductCard";
import { medusaClient } from "../utils/client.js";

export default function Home(props) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [regionid, setRegionid] = useState(props.regionid);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12; // Number of products per page

  useEffect(() => {
    const savedRegion = props.regionid || localStorage.getItem("region");
    if (savedRegion) {
      setRegionid(savedRegion);
    }
  }, [props.regionid]);

  // When region changes, reset products and page and fetch first page
  useEffect(() => {
    if (!regionid) return;

    setProducts([]);
    setPage(0);
    setHasMore(true);

    const createCart = async () => {
      const tempCart = await medusaClient.store.cart.create({ region_id: regionid });
      setCart(tempCart);
    };

    createCart();
    fetchProducts(0); // fetch first page
    localStorage.setItem("region", regionid);
  }, [regionid]);

  // Fetch products for a given page offset
  const fetchProducts = async (pageToFetch) => {
    try {
      const offset = pageToFetch * limit;
      const results = await medusaClient.store.product.list({
        fields: `*variants.calculated_price`,
        region_id: regionid,
        limit,
        offset,
      });

      if (results.products.length < limit) {
        setHasMore(false); // No more products to load
      }

      if (pageToFetch === 0) {
        setProducts(results.products);
      } else {
        setProducts((prev) => [...prev, ...results.products]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setHasMore(false); // stop trying if error
    }
  };

  // Handle Load More button click
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  return (
    <>
      <header>
        <h1 className="my-4">All Products</h1>
      </header>
      <main>
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {products.map((product) => {
            const variant = product.variants?.[0];
            const price = variant?.calculated_price?.calculated_amount || 0;
            return (
              <Col key={product.id}>
                <ProductCard
                  title={product.title}
                  productId={product.id}
                  price={price}
                  thumbnail={product.thumbnail}
                  regionid={regionid}
                />
              </Col>
            );
          })}
        </Row>

        {hasMore && (
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <Button onClick={handleLoadMore}>Load More</Button>
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <p style={{ textAlign: "center", margin: "2rem 0", color: "#666" }}>
            No more products to load.
          </p>
        )}
      </main>
    </>
  );
}
