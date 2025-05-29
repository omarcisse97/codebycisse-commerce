import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner"; // Added for loading indicator
import Alert from "react-bootstrap/Alert";   // Added for error messages

import ProductCard from "../components/ProductCard";
import { medusaClient } from "../utils/client.js";

// Helper function to format price based on currency
const getPriceFormat = (amount, currency) => {
    // Medusa's calculated_amount is typically in the smallest currency unit (e.g., cents)
    const currenciesWithSubunits = ["usd", "eur", "cad", "gbp", "aud"]; // Add more as needed
    const normalizedCurrency = currency.toLowerCase();

    // Divide by 100 for currencies that typically have 2 decimal places.
    // For currencies without decimal places (like JPY, XOF), the divisor remains 1.
    const divisor = currenciesWithSubunits.includes(normalizedCurrency) ? 100 : 1;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: normalizedCurrency.toUpperCase(),
    }).format(amount / divisor);
};

// Helper function for example currency conversion (for price range display)
// In a real application, consider fetching live exchange rates or using Medusa's price lists.
function convertFromUSD(amount, toCurrency) {
    if (toCurrency.toLowerCase() === "usd") {
        return amount;
    }
    const exchangeRates = {
        eur: 0.93,   // Example: 1 USD = 0.93 EUR
        cad: 1.36,   // Example: 1 USD = 1.36 CAD
        xof: 610,    // Example: 1 USD = 610 XOF
    };

    const rate = exchangeRates[toCurrency.toLowerCase()];

    // If rate is not found, default to 1 (or handle error)
    if (!rate) {
        console.warn(`Exchange rate for ${toCurrency} not found. Defaulting to 1.`);
        return amount;
    }

    return amount * rate;
}

// Helper function to create price range objects for the filter dropdown
const createRange = (currency, lt = null, gt = null) => {
    // Return empty object if no currency or no bounds are provided
    if (!currency && lt === null && gt === null) {
        return {};
    }

    const obj = {};
    // Convert bounds to the target currency based on USD base
    const convertedLt = convertFromUSD(lt ?? 0, currency);
    const convertedGt = gt !== null ? convertFromUSD(gt, currency) : undefined; // Use undefined for 'no upper bound'

    obj.value = `${convertedLt}-${convertedGt !== undefined ? convertedGt : ""}`;
    obj.lt = convertedLt;
    if (convertedGt !== undefined) {
        obj.gt = convertedGt;
    }

    // Generate user-friendly display name for the range
    obj.name = `${convertedLt === 0 ? "Under" : getPriceFormat(convertedLt, currency)} ${convertedGt === undefined ? "and Up" : ` - ${getPriceFormat(convertedGt, currency)}`}`;
    return obj;
};

// Helper function to load predefined price ranges based on the region's currency
const priceRangeFilterLoad = (regionObj) => {
    // Assuming USD is the base for defining these ranges (e.g., $25, $50, etc.)
    // These values (24.99, 25, 49.99, etc.) represent standard currency units (dollars, euros, etc.)
    // and will be converted to the target currency by createRange.
    const ranges = {
        usd: [
            createRange("usd", null, 24.99), // Under $25
            createRange("usd", 25, 49.99),    // $25 - $50
            createRange("usd", 50, 99.99),    // $50 - $100
            createRange("usd", 100)           // Over $100
        ],
        cad: [
            createRange("cad", null, 24.99),
            createRange("cad", 25, 49.99),
            createRange("cad", 50, 99.99),
            createRange("cad", 100)
        ],
        eur: [
            createRange("eur", null, 24.99),
            createRange("eur", 25, 49.99),
            createRange("eur", 50, 99.99),
            createRange("eur", 100)
        ],
        xof: [
            createRange("xof", null, 24.99), // Note: XOF is higher value, these ranges might need adjustment for XOF
            createRange("xof", 25, 49.99),
            createRange("xof", 50, 99.99),
            createRange("xof", 100)
        ],
        // Add more currencies and their respective ranges here if needed
    };
    return ranges[regionObj?.currency_code?.toLowerCase()] || []; // Return empty array if currency not found
};

export default function Search(props) {
    const { keyword } = useParams();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(null);
    const [regionid, setRegionid] = useState(props.regionid);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [categories, setCategories] = useState([]);
    const [regionObj, setRegionObj] = useState(null); // Initialize as null
    const [priceRangeFilter, setPriceRangeFilter] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state for initial fetch
    const [error, setError] = useState(null);     // Error state
    const [q, setQ] = useState(keyword)

    const [filters, setFilters] = useState({
        category: { name: "", id: "" },
        price: "*", // Default to "All" price range
        color: "",
        size: "",
        availability: false,
        sortBy: "", // Default to no sorting
    });

    const limit = 12;

    // Effect to set the initial region ID from props or localStorage
    useEffect(() => {
        const savedRegion = props.regionid || localStorage.getItem("region");
        if (savedRegion) {
            setRegionid(savedRegion);
        } else {
            // Handle case where no region is set (e.g., fetch default region)
            setError("No region found. Please select a region.");
            setLoading(false);
        }
    }, [props.regionid]);

    // Effect to load region object, categories, and create cart when regionid changes
    useEffect(() => {
        if (!regionid) return;

        const loadRegionData = async () => {
            setError(null); // Clear previous errors
            try {
                const result = await medusaClient.store.region.retrieve(regionid);
                setRegionObj(result?.region);
            } catch (err) {
                console.error("Failed to load region:", err);
                setError("Failed to load region data.");
            }
        };

        const loadCategories = async () => {
            try {
                const { product_categories } = await medusaClient.store.category.list();
                setCategories(product_categories);
            } catch (err) {
                console.error("Failed to load categories:", err);
                setError("Failed to load categories.");
            }
        };

        const createCart = async () => {
            try {
                const { cart } = await medusaClient.store.cart.create({ region_id: regionid });
                setCart(cart);
            } catch (err) {
                console.error("Failed to create cart:", err);
                setError("Failed to create shopping cart.");
            }
        };

        loadRegionData();
        loadCategories();
        createCart();
        localStorage.setItem("region", regionid);
    }, [regionid]);

    // Effect to update price range filters when regionObj is available
    useEffect(() => {
        if (regionObj?.currency_code) {
            setPriceRangeFilter(priceRangeFilterLoad(regionObj));
        }
    }, [regionObj]);

    // Effect to reset products and page, then fetch new products when filters or regionid change
    // This will trigger a new product fetch every time filters change.
    useEffect(() => {
        if (!regionid || !regionObj) return; // Wait until region data is loaded

        setProducts([]);
        setPage(0);
        setHasMore(true);
        fetchProducts(0);
    }, [filters, regionid, regionObj, q]); // regionObj is a dependency because calculated prices depend on its currency

    // Fetch products with applied filters & pagination
    const fetchProducts = async (pageToFetch) => {
        setLoading(true);
        setError(null); // Clear previous errors

        try {
            const offset = pageToFetch * limit;
            const query = {
                q: q,
                fields: "*variants.calculated_price", // Request product variant prices
                region_id: regionid,
                limit,
                offset,
            };

            if (filters.category && filters.category.id) {
                query["category_id"] = filters.category.id;
            }

            const { products: fetchedProducts } = await medusaClient.store.product.list(query);

            let processedProducts = fetchedProducts;

            // Client-side Price Filtering
            if (filters.price && filters.price !== "*") {
                const tmp_arr = filters.price.split('-');
                let minDollars = Number(tmp_arr[0]);
                // For "Over $100" case, the max is empty, so use max safe integer
                let maxDollars = tmp_arr.length === 2 && tmp_arr[1] !== "" ? Number(tmp_arr[1]) : Number.MAX_SAFE_INTEGER;

                // Convert filter range (in dollars) to cents for comparison with Medusa's calculated_amount (in cents)
                const minCents = minDollars * 100;
                // Only convert max if it's not the "infinity" value
                const maxCents = maxDollars === Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : maxDollars * 100;

                processedProducts = processedProducts.filter(product => {
                    // Check if *any* variant of the product falls within the price range
                    return product.variants.some(variant => {
                        const price = variant.calculated_price?.calculated_amount; // This is in cents
                        return price !== undefined && price >= minCents && price <= maxCents;
                    });
                });
            }

            // Client-side Sorting
            if (filters.sortBy && filters.sortBy !== "") {
                processedProducts.sort((a, b) => {
                    // Assuming you want to sort by the first variant's calculated price.
                    // You might need more complex logic if a product has multiple variants
                    // and you want to sort by, say, the lowest price among its variants.
                    const priceA = a.variants[0]?.calculated_price?.calculated_amount || 0;
                    const priceB = b.variants[0]?.calculated_price?.calculated_amount || 0;

                    if (filters.sortBy === "price-asc") {
                        return priceA - priceB;
                    }
                    if (filters.sortBy === "price-desc") {
                        return priceB - priceA;
                    }
                    return 0; // No sorting if filter value is unrecognized
                });
            }

            if (fetchedProducts.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true); // Ensure hasMore is true if we received full limit
            }

            if (pageToFetch === 0) {
                setProducts(processedProducts);
            } else {
                setProducts((prev) => [...prev, ...processedProducts]);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError("Failed to load products. Please try again later.");
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage);
    };

    const handleFilterChangePrice = (e) => {
        // Only update if the value actually changed to prevent unnecessary re-renders/fetches
        if (e.target.value !== filters.price) {
            setFilters((prev) => ({
                ...prev,
                price: e.target.value,
            }));
        }
    };

    const handleCategoryClick = (cat) => {
        if (cat.name !== filters.category.name) {
            setFilters((prev) => ({
                ...prev,
                category: cat.name === "all" ? { name: "", id: "" } : cat,
            }));
        }
    };

    const handleFilterChangeSort = (e) => {
        if (e.target.value !== filters.sortBy) {
            setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value
            }));
        }
    };
    const handleSearch = () => {

    }

    return (
        <>
            {/* Hero Section */}
            <section className="bg-dark text-white text-center py-5">
                <Container>
                    <h1 className="display-4 fw-bold mb-4">Search</h1>
                    <Form className="d-flex justify-content-center" onSubmit={handleSearch}>
                        <Form.Control
                            type="search"
                            placeholder="Search products..."
                            className="me-2 w-50"
                            aria-label="Search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                        <Button variant="light" type="submit">Search</Button>
                    </Form>
                </Container>
            </section>

            {/* Product Grid + Filters */}
            <Container className="py-5">
                <h2 className="mb-4 text-center">{filters.category.name === ""? "All / " : `${filters.category.name} / `}{q}</h2>
                <Row>
                    {/* Sidebar Filters */}
                    <Col md={3}>
                        <h5>Categories</h5>
                        <Row className="mb-3">
                            <Col xs="auto" className="mb-2">
                                <Button
                                    variant={filters.category.name === "" ? "dark" : "outline-dark"}
                                    onClick={() => handleCategoryClick({ name: "all", id: "" })}
                                >
                                    All
                                </Button>
                            </Col>
                            {categories?.map((cat) => (
                                <Col key={cat?.id} xs="auto" className="mb-2">
                                    <Button
                                        variant={filters.category.name === cat.name ? "dark" : "outline-dark"}
                                        onClick={() => handleCategoryClick(cat)}
                                    >
                                        {cat?.name?.charAt(0).toUpperCase() + cat?.name?.slice(1)}
                                    </Button>
                                </Col>
                            ))}
                        </Row>

                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Price Range</Form.Label>
                                <Form.Select name="price" value={filters.price} onChange={handleFilterChangePrice}>
                                    <option value="*">All</option>
                                    {priceRangeFilter && priceRangeFilter.map((prf, index) => (
                                        <option key={index} value={prf.value}>{prf.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Sort By</Form.Label>
                                <div>
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Default"
                                        name="sortBy"
                                        value=""
                                        checked={filters.sortBy === ""}
                                        onChange={handleFilterChangeSort}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Price: Low to High"
                                        name="sortBy"
                                        value="price-asc"
                                        checked={filters.sortBy === "price-asc"}
                                        onChange={handleFilterChangeSort}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Price: High to Low"
                                        name="sortBy"
                                        value="price-desc"
                                        checked={filters.sortBy === "price-desc"}
                                        onChange={handleFilterChangeSort}
                                    />
                                </div>
                            </Form.Group>
                        </Form>
                    </Col>

                    {/* Product Grid */}
                    <Col md={9}>
                        {loading && products.length === 0 && ( // Show spinner only on initial load or full refresh
                            <div className="text-center my-5">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading products...</span>
                                </Spinner>
                                <p className="mt-2">Loading products...</p>
                            </div>
                        )}

                        {error && (
                            <Alert variant="danger" className="text-center my-4">
                                {error}
                            </Alert>
                        )}

                        {!loading && products.length === 0 && !error && (
                            <Alert variant="info" className="text-center my-4">
                                No products found matching your criteria.
                            </Alert>
                        )}

                        <Row xs={1} sm={2} md={2} lg={3} className="g-4">
                            {products.map((product) => {
                                const variant = product.variants?.[0];
                                const price = variant?.calculated_price?.calculated_amount || 0;
                                return (
                                    <Col key={product.id}>
                                        <ProductCard
                                            title={product.title}
                                            productId={product.id}
                                            price={price} // Pass price in cents
                                            currencyCode={regionObj?.currency_code} // Pass currency code for formatting in ProductCard
                                            thumbnail={product.thumbnail}
                                            regionid={regionid}
                                        />
                                    </Col>
                                );
                            })}
                        </Row>

                        {hasMore && (
                            <div className="text-center mt-4">
                                <Button
                                    variant="outline-dark"
                                    onClick={handleLoadMore}
                                    disabled={loading} // Disable button while loading more
                                >
                                    {loading ? 'Loading...' : 'Load More'}
                                </Button>
                            </div>
                        )}

                        {!hasMore && products.length > 0 && (
                            <p className="text-center mt-4 text-muted">You've reached the end. Time to check your cart? 😉</p>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}