import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Navbar,
    Nav,
    NavDropdown,
    Badge,
    Button
} from 'react-bootstrap';
import { medusaClient } from '../utils/client';
import { FaShoppingCart } from 'react-icons/fa';
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';

export default function NavHeader(props) {
    const cartCount = localStorage.getItem('cartCount') ?? 0;
    const [regions, setRegions] = useState([]);
    const [region, setRegion] = useState({});
    const [regionid, setRegionid] = useState(props.regionid);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadRegions = async () => {
            const res = await medusaClient.store.region.list();
            setRegions(res);
        };

        loadRegions();

        const savedRegion = localStorage.getItem("region");
        if (!props.regionid && savedRegion) {
            props.onRegionSelect(savedRegion);
        }
    }, []);

    useEffect(() => {
        const getRegion = async () => {
            if (regionid) {
                const res = await medusaClient.store.region.retrieve(regionid);
                setRegion(res);
            }
        };

        getRegion();
    }, [regionid]);

    useEffect(() => {
        if (props.regionid && props.regionid !== regionid) {
            setRegionid(props.regionid);
        }
    }, [props.regionid]);

    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
        // You can later redirect or filter products here
        navigate(`/search/${searchTerm}`);
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm py-2">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold text-light">
                    CodeByCisse
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-navbar" />

                <Navbar.Collapse id="main-navbar">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/" className="text-light fw-semibold">
                            Products
                        </Nav.Link>

                        <NavDropdown
                            title={region?.region?.name || "Loading..."}
                            id="region-selector"
                            menuVariant="dark"
                            className="text-light"
                        >
                            {regions?.regions?.map((r) => (
                                <NavDropdown.Item
                                    key={r.id}
                                    onClick={() => props.onRegionSelect(r.id)}
                                >
                                    {r.name}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                    </Nav>
                    <div className="me-3 my-2 my-lg-0 w-100 w-lg-25">
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            onSearch={handleSearch}
                        />
                    </div>
                    <Nav className="ms-auto d-flex align-items-center">
                        <Button as={Link} to="/cart" variant="success" className="d-flex align-items-center">
                            <FaShoppingCart className="me-2" />
                            <span>Cart</span>
                            <Badge bg="light" text="dark" className="ms-2">{cartCount}</Badge>
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
