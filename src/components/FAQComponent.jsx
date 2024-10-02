import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <div
                className="border-b py-2 flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-bold">{question}</span>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </div>
            {isOpen && <div className="py-2">{answer}</div>}
        </div>
    );
};

const FAQComponent = () => {
    const faqData = [
        { question: "How does AirLine Manager work?", answer: "AirLine Manager searches hundreds of airlines and travel agents to find the best flight deals." },
        { question: "How can I find the cheapest flight using AirLine Manager?", answer: "Use the 'Cheapest Month' search feature to find the lowest prices." },
        { question: "Where should I book a flight to right now?", answer: "Check out our 'Top Deals' section for the latest offers." },
        { question: "Do I book my flight with AirLine Manager?", answer: "No, AirLine Manager redirects you to the airline or travel agent to complete your booking." },
        { question: "What happens after I have booked my flight?", answer: "You will receive a confirmation email from the airline or travel agent." },
        { question: "Does AirLine Manager do hotels too?", answer: "Yes, AirLine Manager also compares hotel prices from various booking sites." },
        { question: "What about car hire?", answer: "AirLine Manager can help you find the best car hire deals as well." },
        { question: "What’s a Price Alert?", answer: "A Price Alert notifies you when the price of a flight changes." },
        { question: "Can I book a flexible flight ticket?", answer: "Yes, look for flights with flexible booking options." },
        { question: "Can I book flights that emit less CO₂?", answer: "Yes, AirLine Manager highlights flights with lower CO₂ emissions." }
    ];

    return (
        <div className="p-8 py-0">
            <h1 className="text-2xl font-bold mb-4">Booking flights with AirLine Manager</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    {faqData.slice(0, 5).map((item, index) => (
                        <FAQItem key={index} question={item.question} answer={item.answer} />
                    ))}
                </div>
                <div>
                    {faqData.slice(5).map((item, index) => (
                        <FAQItem key={index} question={item.question} answer={item.answer} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQComponent;
