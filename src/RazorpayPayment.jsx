import React, { useState } from 'react';
import { Button, message, Modal, Typography, Input } from 'antd';
import axios from 'axios';

const { Title, Paragraph } = Typography;

const RazorpayPayment = () => {
  const [paymentId, setPaymentId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  const handlePayment = async () => {
    try {
      // Validate user inputs
      if (!amountInput || !descriptionInput) {
        message.error('Please enter both amount and description.');
        return;
      }

      const response = await axios.get('http://52.91.207.136:9000/payment/initiate/'+amountInput);
      console.log("Response from server: " + JSON.stringify(response));

      const { order_id, amount, currency } = response.data;

      // Set the order details
      setOrderId(order_id);

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_tF42jI563EUWQE', // Replace with your Razorpay API key
        amount: amount,
        currency: currency,
        name: 'DHANESH-VL',
        description: descriptionInput,
        order_id: order_id,
        handler: async function (response) {
          // Handle successful payment
          setPaymentId(response.razorpay_payment_id);
          setPaymentSuccess(true);

          // You can send the payment ID and order ID to your backend for verification and completion
          try {
            await axios.post('http://52.91.207.136:9000/payment/complete', {
              payment_id: response.razorpay_payment_id,
              order_id: order_id,
            });
            message.success('Payment successful!');
          } catch (error) {
            message.error('Error completing payment. Please contact support.');
          }

          // Show the Modal after successful payment
          setModalVisible(true);
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '1234567890',
        },
        notes: {
          address: 'Nagercoil',
        },
        theme: {
          color: '#1890ff', // Ant Design primary color
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      message.error('Error initiating payment. Please try again later.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    // Reset the form after closing the modal
    resetForm();
  };

  const resetForm = () => {
    setAmountInput('');
    setDescriptionInput('');
    setPaymentId(null);
    setOrderId(null);
    setPaymentSuccess(false);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Title level={2}>Razorpay Payment Integration</Title>
      <Input
        placeholder="Amount"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <Input
        placeholder="Description"
        value={descriptionInput}
        onChange={(e) => setDescriptionInput(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <Button type="primary" size="large" onClick={handlePayment}>
        Pay Now
      </Button>
      
      {(paymentSuccess || modalVisible) && (
        <Modal
          open={modalVisible}
          title={paymentSuccess ? "Payment Successful" : "Payment Failed"}
          onCancel={closeModal}
          footer={[
            <Button key="close" type="primary" onClick={closeModal}>
              Close
            </Button>,
          ]}
        >
          {paymentSuccess ? (
            <>
              <Paragraph>
                Your payment was successful! Here are the details:
              </Paragraph>
              <Paragraph strong>Payment ID:</Paragraph>
              <Paragraph>{paymentId}</Paragraph>
              <Paragraph strong>Order ID:</Paragraph>
              <Paragraph>{orderId}</Paragraph>
            </>
          ) : (
            <Paragraph>
              Unfortunately, the payment has failed. Please try again.
            </Paragraph>
          )}
        </Modal>
      )}
    </div>
  );
};

export default RazorpayPayment;
