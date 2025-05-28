import React from 'react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { medusaClient } from '../utils/client';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';

export default function ProductCard(props) {
    const [region, setRegion] = useState(null);
    const [formattedPricet, setFormattedPricet] = useState('0.0');
    const formattedPrice = '0.0'

    

    useEffect(() => {
        const getRegionById = async () => {
            const temp = await medusaClient.store.region.retrieve(props.regionid);
            setRegion(temp);
        }

        getRegionById();
    }, [props.regionid]);

    useEffect(() => {
        if (region) {
            setFormattedPricet(null);
            setFormattedPricet(new Intl.NumberFormat('en-US', { style: 'currency', currency: region.region.currency_code }).format(props.price / 100))
        }


    }, [region])

    

    return (
        <Card>
            <Card.Img variant="top" src={props.thumbnail} alt={props.title} />
            <Card.Body>
                <Card.Title>{props.title}</Card.Title>
                <Card.Text className='text-success fw-bold'>
                    {formattedPricet?formattedPricet: formattedPrice}
                </Card.Text>
                <Link to={`/products/${props.productId}`}>View Details</Link>
            </Card.Body>
        </Card>
    )
}

ProductCard.propTypes = {
    title: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    productId: PropTypes.string.isRequired
};

