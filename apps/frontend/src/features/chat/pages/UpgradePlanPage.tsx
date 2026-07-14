import React from "react";
import { useNavigate } from "react-router-dom";

interface Plan {
  id: string;
  avatar: string;
  name: string;
  price: string | null;
  priceUnit?: string;
  priceSub?: string;
  ctaLabel: string;
  features: string[];
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    avatar: "/shidoon-blue-icon.jpg",
    name: "FREE",
    price: null,
    ctaLabel: "Chat with Arya free",
    features: [
      "+ 2 AI mock interview free per week",
      "+ 40 chat with Arya per day",
      "+ Support 20+ coding languages",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    avatar: "/shidoon-blue-icon.jpg",
    name: "$5",
    price: "5",
    priceUnit: "USD/month",
    priceSub: "billed annually",
    ctaLabel: "Chat with Arya pro",
    features: [
      "+ 2 AI mock interview free per day",
      "+ 100 chat with Arya per day",
      "+ Support 50+ coding languages",
    ],
    highlighted: false,
  },
  {
    id: "pro-max",
    avatar: "/shidoon-blue-icon.jpg",
    name: "$10",
    price: "10",
    priceUnit: "USD/month",
    priceSub: "billed annually",
    ctaLabel: "Chat with Arya pro max",
    features: [
      "+ unlimited AI Mock interview",
      "+ unlimited chat with Arya",
      "+ Dating enable with Arya",
    ],
    highlighted: true,
  },
];

const UpgradePlanPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="upgrade-page">
      {/* Back button */}
      <button className="upgrade-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
        &#8249;
      </button>

      <h1 className="upgrade-title">Update your plan</h1>

      <div className="upgrade-cards">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`upgrade-card${plan.highlighted ? " highlighted" : ""}`}
          >
            {/* Avatar */}
            <img src={plan.avatar} alt={plan.ctaLabel} className="upgrade-avatar" />

            {/* Price / name */}
            <div className="upgrade-price-row">
              {plan.price ? (
                <>
                  <span className="upgrade-price">${plan.price}</span>
                  <div className="upgrade-price-meta">
                    <span>{plan.priceUnit}</span>
                    <span>{plan.priceSub}</span>
                  </div>
                </>
              ) : (
                <span className="upgrade-price-free">{plan.name}</span>
              )}
            </div>

            {/* CTA */}
            <button
              className={`upgrade-cta${plan.highlighted ? " upgrade-cta-dark" : ""}`}
            >
              {plan.ctaLabel}
            </button>

            {/* Divider */}
            <hr className="upgrade-divider" />

            {/* Features */}
            <ul className="upgrade-features">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpgradePlanPage;
