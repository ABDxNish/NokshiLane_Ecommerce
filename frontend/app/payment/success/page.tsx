import Link from 'next/link';


export default function PaymentSuccessPage() {
  return (
    <section className="result-page">
      <div className="result-card">
        <span>
          PAYMENT UPDATE
        </span>

        <h1>
          Payment successful
        </h1>

        <p>
          SSLCOMMERZ payment was
          validated by the backend and
          your order is now confirmed.
        </p>

        <div className="result-actions">
          <Link
            href="/orders"
            className="primary-button"
          >
            View orders
          </Link>

          <Link
            href="/shop"
            className="outline-button"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
