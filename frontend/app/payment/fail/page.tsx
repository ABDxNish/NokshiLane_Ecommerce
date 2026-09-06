import Link from 'next/link';


export default function PaymentFailPage() {
  return (
    <section className="result-page">
      <div className="result-card">
        <span>
          PAYMENT UPDATE
        </span>

        <h1>
          Payment failed
        </h1>

        <p>
          The online payment could not
          be verified. The order is
          cancelled and reserved stock
          is restored when applicable.
        </p>

        <div className="result-actions">
          <Link
            href="/shop"
            className="primary-button"
          >
            Return to shop
          </Link>

          <Link
            href="/orders"
            className="outline-button"
          >
            View orders
          </Link>
        </div>
      </div>
    </section>
  );
}
