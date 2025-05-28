import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { medusaClient } from '../utils/client.js'

const getFormattedPrice = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount / 100);
}

// TODO: Add functions to handle the add to cart functionality

export default function Product(props) {
   const { id } = useParams();
   const [product, setProduct] = useState({})
   const [regionid, setRegionid] = useState(props.regionid);
   const [region, setRegion] = useState({});
   
    useEffect(() => {
        // On mount: try to load from props or localStorage
        const savedRegion = props.regionid || localStorage.getItem("region");
        
        if (savedRegion) {
            setRegionid(savedRegion);

        }
    }, [props.regionid]);

    useEffect(() => {
        const getRegion = async() => {
            const temp = await medusaClient.store.region.retrieve(regionid);
            setRegion(temp);
        }

        const getIndividualProduct = async () => {
            const results = await medusaClient.store.product.retrieve(id, {
            fields: `*variants.calculated_price`,
            region_id: regionid
        });
            setProduct(results.product)
        }
        getIndividualProduct();
        getRegion();
    }, [regionid])

  console.log(product);
  console.log(region);
    return (
      <>
      <title>{props.title?props.title : "CodeByCisse - Commerce"}</title>
      <main className="mt-5">
          <Container>
              <Row>
                  <Col>
                      <img width="500px"
                          alt={product.title}
                          src={product.thumbnail} />
                  </Col>
                  <Col className="d-flex justify-content-center flex-column">
                      <h1>{product.title}</h1>
                      <p className="mb-4 text-success fw-bold">{
                      getFormattedPrice(
                        product.variants?.[0]?.calculated_price?.calculated_amount || 0,
                        region?.region?.currency_code?region?.region?.currency_code: 'USD'
                      )
                      }
                      </p>
                      <p className="mb-5">{product.description}</p>
                      <Button variant="success" size="lg" onClick={() => { console.log("Add to cart") }}>Add to cart</Button>
                  </Col>
              </Row>
          </Container>
      </main>
      </>
    )
}

