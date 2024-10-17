export async function initiateMpesa(phone: number, price: number) {
    const res = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "BusinessShortCode": "174379",
            "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMTYwMjE2MTY1NjI3",
            "Timestamp": "20160216165627",
            "TransactionType": "CustomerPayBillOnline",
            "Amount": "1",
            "PartyA": "254708374149",
            "PartyB": "174379",
            "PhoneNumber": "254708374149",
            "CallBackURL": "https://mydomain.com/pat",
            "AccountReference": "Test",
            "TransactionDesc": "Test"
        })
    });

    const response = await res.json();
    return response;
}

