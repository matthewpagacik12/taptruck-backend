require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const xoauth2 = require('xoauth2');

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: 'https://taptruck-quote-site.netlify.app',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from 'public' directory
app.use(express.static('public'));

// POST route to handle form submission
app.post('/api/send-quote', async (req, res) => {
  const { email, packageSelect, numberOfGuests, bartendingHours, mileage, state, salesTaxRate, additionalNotes, totalBeforeTax, totalAfterTax } = req.body;
  const date = new Date().toLocaleDateString();

  let packageUnitPrice;
  let calculatedMilage = mileage - 30;
  calculatedMilage = calculatedMilage * 2;

  if (calculatedMilage <= 30) {
    calculatedMilage = 30 - mileage;
  }

  // house package pricing
  if (packageSelect === "house") {
    packageUnitPrice = 12;
  }
  // custom package pricing
  else if (packageSelect === "custom") {
    packageUnitPrice = 17;
  }
  // super package pricing
  else if (packageSelect === "super") {
    packageUnitPrice = 25;
  }
  else {
    return res.status(400).send('Invalid package selection');
  }

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email content
  let mailOptions = {
    from: 'Tap Truck CT',
    to: `${email}, taptruckct@gmail.com`, // Send to both customer and your email
    subject: 'Tap Truck Quote',
    html: `
      <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }

        .invoice {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ccc;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          color: #000000;
        }

        .invoice-header p {
          margin: 5px 0;
        }

        .invoice-header-left, .invoice-header-right {
          flex: 1;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .invoice-table th, .invoice-table td {
          border: 1px solid #000;
          padding: 10px;
          text-align: center;
        }

        .invoice-table th {
          background-color: #5c819d;
          color: #fff;
          font-weight: bold;
        }

        .invoice-total {
          text-align: right;
        }

        .invoice-total p {
          font-weight: bold;
          margin: 5px 0;
        }

        .invoice-footer {
          color: #000000;
        }
      </style>

        </head>
        <body>
           <div class="invoice">
        <div class="invoice-header">
            <div class="invoice-header-left">
                <img src="https://taptruckct.com/wp-content/uploads/2024/06/Chris_tap_truck_logo-2.png" alt="Tap Truck CT Logo" width="150">
                <h1>Tap Truck CT</h1>
                <p>Email: taptruckct@gmail.com</p>
                <p>Phone: (203) 772-8382</p>
                <p>***This quote is not final, the final quote may vary***
            </div>
            <div class="invoice-header-right">
                <h2>Quote</h2>
                <p>Date: ${date}</p>
            </div>
        </div>

        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Drinks</th>
                    <th>Guests</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${packageSelect}</td>
                    <td>${numberOfGuests}</td>
                    <td>$${packageUnitPrice}</td>
                    <td>$${numberOfGuests * packageUnitPrice}</td>
                </tr>
              <thead>
                <tr>
                    <th>Bartending</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
              </thead>
                <tr>
                    <td>Full Service (3 Hour Minimum)</td>
                    <td>${bartendingHours}</td>
                    <td>$300/hour</td>
                    <td>$${bartendingHours * 300}</td>
                </tr>
     
                <tr>
                    <td>Mileage Charge (First 30 Miles Free)</td>
                    <td>${mileage}</td>
                    <td>$2/mile over 30 miles</td>
                    <td>$${calculatedMilage}</td>
                </tr>
            </tbody>
                <thead>
                <tr>
                    <th>Additional Notes</th>
                </tr>
              </thead>
                <tr>
                    <td>${additionalNotes}</td>
                </tr>
     
        </table>

        <div class="invoice-total">
                <p><strong>${state} Sales Tax Rate:</strong> ${(salesTaxRate * 100).toFixed(2)}%</p>
            <p><strong>Subtotal:</strong> $${totalBeforeTax.toFixed(2)}</p>
            <p><strong>Total:</strong> $${totalAfterTax.toFixed(2)}</p>
        </div>

        <div class="invoice-footer">
            <p>Thank you for requesting a quote from us!</p>
        </div>
    </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Quote sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
