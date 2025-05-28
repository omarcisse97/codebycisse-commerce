import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Badge from 'react-bootstrap/Badge'
import { NavDropdown } from 'react-bootstrap'
import { medusaClient } from '../utils/client'

export default function NavHeader(props) {
    const cartCount = localStorage.getItem('cartCount') ?? 0;
    const [regions, setRegions] = useState([]);
    const [region, setRegion] = useState({});
    const [regionid, setRegionid] = useState(props.regionid);

   useEffect(() => {
    const loadRegions = async () => {
        const res = await medusaClient.store.region.list();
        setRegions(res);
    };

    loadRegions();

    const savedRegion = localStorage.getItem("region");
    if (!props.regionid && savedRegion) {
        props.onRegionSelect(savedRegion); // update parent from localStorage
    }
}, []);

// This watches actual regionid and fetches region data
useEffect(() => {
    const getRegion = async () => {
        if (regionid) {
            const res = await medusaClient.store.region.retrieve(regionid);
            setRegion(res);
        }
    };

    getRegion();
}, [regionid]);

// Keep local state in sync with prop
useEffect(() => {
    if (props.regionid && props.regionid !== regionid) {
        setRegionid(props.regionid);
    }
}, [props.regionid]);

    return (
        <Navbar bg="dark" variant="dark">
            <Container fluid>
                <Nav className="w-25 d-flex align-items-center justify-content-between">
                    <Navbar.Brand as={Link} to="/" className="fw-bold text-light">
                        CodeByCisse
                    </Navbar.Brand>

                    <Navbar.Text className="text-light fw-bold">
                        <Link className="text-decoration-none text-light" to="/">Products</Link>
                    </Navbar.Text>
                </Nav>
                {" "}
                <Nav className="me-auto">
             
                    <NavDropdown title={region?.region?.name || "Loading"} id="basic-nav-dropdown">
                        {regions?.regions?.map((r) => (
                            <NavDropdown.Item key={r.id} onClick={() => props.onRegionSelect(r.id)}>
                                {r.name}
                            </NavDropdown.Item>
                        ))}
                    </NavDropdown>
                </Nav>

                <Nav>
                    <Navbar.Text className="text-light fw-bold">
                        Cart
                        <Badge bg="success" className="ms-2">{cartCount}</Badge>
                        <span className="visually-hidden">{cartCount} items in the cart</span>
                    </Navbar.Text>
                </Nav>
            </Container>
        </Navbar>
    );
}
