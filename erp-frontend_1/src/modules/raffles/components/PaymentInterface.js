import React from 'react';
import '../assets/css/components/PaymentInterface.css';
import { Link } from 'react-router-dom';

const PaymentInterface = () => {
  return (
    <div className="payment-app">
      {/* Navbar Component */}
      <div className="navbar">
        <div className="navbar-left">
          <button className="menu-button">☰</button>
        </div>
        <div className="navbar-right">
          <Link to="/">
            <button className="notification-button">🏠</button>
          </Link>
          <div className="avatar">AC</div>
        </div>
      </div>
      
      {/* Payment Component */}
      <div className="options-bar">
        <div className="option">
          <svg className="option-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0056b3">
            <path d="M21,14H3V4H21ZM21,2H3C1.9,2 1,2.9 1,4V16C1,17.1 1.9,18 3,18H21C22.1,18 23,17.1 23,16V4C23,2.9 22.1,2 21,2ZM18,20H6V22H18Z"/>
          </svg>
          Facturar
        </div>
        <div className="option">
          <svg className="option-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0056b3">
            <path d="M3,4H21V8H3ZM3,10H13V14H3ZM3,16H21V20H3Z"/>
          </svg>
          Lista de precios
        </div>
      </div>
      
      <div className="payment-container">
        <div className="total-balance-card">
          <div className="balance-header">
            <span className="money-icon">💵</span>
            <span className="info-icon">ⓘ</span>
          </div>
          <h4 className="balance-title">Saldo total</h4>
          <p className="balance-amount">$11,019.00</p>
          <p className="balance-description">Monto total que tienes por pagar.</p>
        </div>
        
        <div className="detail-cards-container">
          <div className="detail-card">
            <div className="detail-icon expired-icon">📅</div>
            <h5 className="detail-title">Saldo vencido</h5>
            <p className="detail-amount">$0.00</p>
          </div>
          
          <div className="detail-card">
            <div className="detail-icon pending-icon">⚠️</div>
            <h5 className="detail-title">Saldo por vencer</h5>
            <p className="detail-amount">$2,084.00</p>
          </div>
          
          <div className="detail-card">
            <div className="detail-icon unrecognized-icon">📄</div>
            <h5 className="detail-title">Saldo sin reconocer</h5>
            <p className="detail-amount">$0.00</p>
          </div>
        </div>
        
        <button className="pay-button">Realizar pago</button>
      </div>
    </div>
  );
};

export default PaymentInterface;
