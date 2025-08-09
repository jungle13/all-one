import aiohttp
import json

# Configuration
ACCESS_TOKEN = "EAAKaX4DAZCwcBO2PoU05EAtOKmj0skRQbpNl9wi53riogjWkE5bNXenKLBtfoLtFsRt4lEwhtA0f7A9Pmkyu2wcZAy92A8dB3pt5nBX4g6NqCkKPY9exiw8Hn2u9kOm9nsw9LRSx1DKZCdnvZCgCUh7Dr0KhvMPc8C0mZBwG0ZBuSx4dV9sdAb7FWaH1hmDQZDZD"
PHONE_NUMBER_ID = "649273224941709" 
API_VERSION = "v22.0"  # Current API version
 
async def send_purchase_notification(recipient, name_param, receipt_param):
    # Purchase notification function
    #   Args:
    #   recipient: Phone number of the recipient
    #   name_param: Name of the client
    #   receipt_param: Parameter for the receipt (TODO: Change to the actual receipt)

    headers = {
        "Content-type": "application/json",
        "Authorization": f"Bearer {ACCESS_TOKEN}",
    }

    components = [
        {
            "type": "body",
            "parameters": [{"type": "text", "parameter_name": "name",  "text": name_param}]
        },
        {
            "type": "button",
            "sub_type": "url",
            "index": 0,
            "parameters": [
                {
                    "type": "text",
                    "text": receipt_param
                }
            ]
        }
    ]

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
        "type": "template",
        "template": {
            "name": "demo",
            "language": {"code": "es_CO"},
            "components": components
        }
    }

    url = f"https://graph.facebook.com/{API_VERSION}/{PHONE_NUMBER_ID}/messages"

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, data=json.dumps(payload), headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    print("Message sent successfully!")
                    print(f"Message ID: {result['messages'][0]['id']}")
                    return result
                else:
                    error = await response.text()
                    print(f"Error {response.status}: {error}")
                    return None
        except aiohttp.ClientConnectorError as e:
            print(f'Connection Error: {str(e)}')
            return None

