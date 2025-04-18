
document.addEventListener("DOMContentLoaded", () => {
  if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
    const btn = document.createElement("apple-pay-button");
    btn.setAttribute("buttonstyle", "black");
    btn.setAttribute("type", "buy");
    btn.style.height = "50px";
    btn.onclick = startApplePay;
    document.getElementById("apple-pay-button").appendChild(btn);
  }
});

function startApplePay() {
  const request = {
    countryCode: "US",
    currencyCode: "USD",
    total: { label: "ReapWallet", amount: "1.00" },
    supportedNetworks: ["visa", "masterCard", "amex"],
    merchantCapabilities: ["supports3DS"],
    merchantIdentifier: "merchant.reapwarewallet"
  };

  const session = new ApplePaySession(3, request);

  session.onvalidatemerchant = async (event) => {
    const res = await fetch("/api/validate-merchant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ validationURL: event.validationURL })
    });
    const merchantSession = await res.json();
    session.completeMerchantValidation(merchantSession);
  };

  session.onpaymentauthorized = (event) => {
    session.completePayment(ApplePaySession.STATUS_SUCCESS);
    alert("✅ Payment Authorized");
  };

  session.begin();
}
