import Link from 'next/link';


export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="brand light">
          nokshi
          <span>
            lane
          </span>
        </div>

        <p>
          Contemporary fashion and
          lifestyle essentials for
          everyday Bangladesh.
        </p>
      </div>


      <div>
        <h4>
          Shop
        </h4>

        <Link href="/shop">
          All Products
        </Link>

        <Link href="/shop?category=women">
          Women
        </Link>

        <Link href="/shop?category=men">
          Men
        </Link>

        <Link href="/shop?category=footwear">
          Footwear
        </Link>
      </div>


      <div>
        <h4>
          Customer
        </h4>

        <Link href="/orders">
          My Orders
        </Link>

        <Link href="/wishlist">
          Wishlist
        </Link>

        <Link href="/profile">
          Account
        </Link>
      </div>


      <div>
        <h4>
          Bangladesh Delivery
        </h4>

        <p>
          Dhaka delivery:
          ৳80
        </p>

        <p>
          Outside Dhaka:
          ৳120
        </p>

        <p>
          COD + SSLCOMMERZ
        </p>
      </div>
    </footer>
  );
}
