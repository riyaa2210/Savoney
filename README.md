## Savoney — Smart Wealth Advisor and Compliance Platform
Savoney is a modern fintech platform designed to help users manage wealth, get AI-generated investment suggestions, and ensure secure and compliant transactions.
The project focuses on clarity, minimalism, and practical usability.

 #Live Demo and Video

Live Project:[https://savoney-f6588b6e.base44.app/](https://savoney-f6588b6e.base44.app/)
---
Demo Video:[https://youtu.be/JoAmVrQo3QQ?si=OTsa-hsBw7I3MJjk](https://youtu.be/JoAmVrQo3QQ?si=OTsa-hsBw7I3MJjk)
---
 #Features
1. AI-Based Portfolio Recommendations-
Analyses user goals, risk profiles, and preferences to suggest portfolio allocations.
Uses an AI engine to adjust suggestions dynamically based on inputs.

2. Clean and Secure User Onboarding-
Collects essential user and KYC details in a guided, step-by-step flow.
Ensures all fields are validated before moving forward.

3. Secure Transaction Processing-
Every transaction goes through a verification layer that checks for authorization, data consistency, and potential risks.

4. Compliance Monitoring-
Applies rule-based compliance checks and highlights unusual patterns to maintain transparency.

5. Unified Dashboard-
Users can track wallet balance, portfolio insights, goals, and transaction history in one place.
The interface is intentionally minimal to avoid overwhelming users.

6. Scalable Backend-
Uses Node.js and Express with structured API routes and MongoDB storage.

#Tech Stack

1.Frontend:
- Next.js or React
- Tailwind CSS
- Recharts for analytics

2.Backend:
- Node.js
- Express.js
- REST APIs

3.Database:
-MongoDB (Mongoose)
  
**Integrations:**
- Large Language Models (OpenAI, Gemini)
- JWT authentication
- Encryption utilities
---
## Transaction Security Approach
Savoney processes every transaction through multiple checks:
1. Token-based authentication (JWT)
2. Encrypted data transfer
3. Input validation
4. Signature verification
5. Compliance rules
If any of the checks fail, the transaction is blocked immediately.
---
## Project Structure
```
savoney/
 ┣ pages/
 ┃ ┣ index.js
 ┃ ┣ wallet.js
 ┃ ┣ transactions.js
 ┣ components/
 ┣ utils/
 ┣ backend/
 ┗ README.md
```
---
## Setup Instructions

Clone the repository:

```bash
git clone https://github.com/riyaa2210/Savoney.git
cd Savoney/savoney1
```
Install frontend dependencies:
```bash
npm install
npm run dev
```
Backend (if used separately):
```bash
cd backend
npm install
npm start
```
---
## Future Enhancements
- ML-based fraud score
- Alerts for suspicious transactions
- UPI and banking integration
- Real-time financial APIs (stocks, mutual funds)
- Gamified savings system
---
## Contributing
Contributions are welcome.
Open an issue before large changes to keep the direction consistent.
---
## License
MIT License.
