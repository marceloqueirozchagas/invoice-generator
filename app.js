const divForm = document.getElementById('div-form');
const divPrint = document.getElementById('div-print');
const tableForm = document.getElementById('table-form');

const btnAddItem = document.getElementById('btn-add-item');
const btnPreview = document.getElementById('btn-preview');
const btnPrint = document.getElementById('btn-print');
const btnClose = document.getElementById('btn-close');

btnAddItem?.addEventListener('click', () => { addItem() });
btnPreview?.addEventListener('click', previewInvoice);
btnPrint?.addEventListener('click', printInvoice);
btnClose?.addEventListener('click', closePreviewInvoice);

let itemId = 0;
let invoice = {
    invoiceTotal: 0,
    items: []
}

function addItem(description = '', rate = 0, quantity = 0, amount = 0) {
    const tbody = tableForm.getElementsByTagName('tbody')[0];
    const newRow = tbody.insertRow();
    newRow.id = `tr-item-${itemId}`;
    newRow.innerHTML = `
    <tr>
        <td class="td-no-border td-actions">
            <button title="Remove Item" class="btn-add-remove" onclick="removeItem(${itemId})">
                <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
                    <path fill="currentColor"
                        d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z">
                    </path>
                </svg>
            </button>
        </td>
        <td class="td-no-border">
            <input type="text" id="input-${itemId}-description" value="${description}" onkeyup="updateItem(${itemId})">
        </td>
        <td class="td-no-border td-rate">
            <input type="text" id="input-${itemId}-rate" value="${rate}" onkeyup="updateItem(${itemId})">
        </td>
        <td class="td-no-border td-quantity">
            <input type="number" id="input-${itemId}-quantity" value="${quantity}" onChange="updateItem(${itemId})" >
        </td>
        <td class="td-no-border td-amount">
            $<span id="span-${itemId}-amount">${amount}</span>
        </td>
    </tr>
    `;
    invoice.items.push({
        id: itemId,
        description: description,
        rate: rate,
        quantity: quantity,
        amount: amount
    });
    itemId++;
}

function removeItem(itemId) {
    if (invoice.items.length > 1) {
        document.getElementById(`tr-item-${itemId}`).remove();
        invoice.items = invoice.items.filter(x => x.id != itemId);
        updateTotal();
    }
}

function updateItem(itemId) {
    const description = document.getElementById(`input-${itemId}-description`).value;
    const rate = Number(document.getElementById(`input-${itemId}-rate`).value);
    const quantity = Number(document.getElementById(`input-${itemId}-quantity`).value);
    const amount = rate * quantity;

    setElementValue(`span-${itemId}-amount`, amount);
    invoice.items[itemId] = {
        id: itemId,
        description: description,
        rate: rate ? rate : 0,
        quantity: quantity ? quantity : 0,
        amount: amount ? amount : 0
    };

    updateTotal();
}

function updateTotal() {
    const total = invoice.items.reduce((acc, obj) => {
        return acc + obj.amount
    }, 0);

    setElementValue(`td-total`, total);
    invoice.invoiceTotal = total;
}

function previewInvoice() {
    divForm.classList.toggle('d-none');
    divPrint.classList.toggle('d-none');
    prepareInvoicePreview();
}

function closePreviewInvoice() {
    divForm.classList.toggle('d-none');
    divPrint.classList.toggle('d-none');
}

function printInvoice() {
    window.print();
}

function getDataFromForm(formId) {
    const form = document.getElementById(formId);
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
}

function prepareInvoicePreview() {
    invoice.business = getDataFromForm('form-business');
    invoice.client = getDataFromForm('form-client');
    invoice.invoiceNumber = document.getElementById('invoiceNumber').value;
    invoice.invoiceDate = document.getElementById('invoiceDate').value;
    invoice.invoiceNotes = document.getElementById('invoice-notes').value;

    setElementValue('print-invoiceNumber', invoice.invoiceNumber);
    setElementValue('print-invoiceDate', formatDate(invoice.invoiceDate));
    setElementValue('print-invoiceTotal', invoice.invoiceTotal);
    setElementValue('print-table-total', invoice.invoiceTotal);
    setElementValue('print-invoice-notes', invoice.invoiceNotes);

    Object.keys(invoice.business).forEach((key) => {
        setElementValue(`print-${key}`, invoice.business[key]);
    });

    Object.keys(invoice.client).forEach((key) => {
        setElementValue(`print-${key}`, invoice.client[key]);
    });

    const tablePrint = document.getElementById('table-print').getElementsByTagName('tbody')[0];
    tablePrint.innerHTML = '';
    let htmlRows = '';

    invoice.items.forEach(item => {
        htmlRows = htmlRows + `
            <tr>
                <td>${item.description}</td>
                <td class="td-rate">$${item.rate}</td>
                <td class="td-quantity">${item.quantity}</td>
                <td class="td-amount">$${item.amount}</td>
            </tr>
        `;
    });
    tablePrint.innerHTML = htmlRows;
    localStorage.setItem('invoice', JSON.stringify(invoice));
}

function setElementValue(elementName, elementValue = '') {
    const element = document.getElementById(elementName);
    if (element)
        element.innerText = elementValue;
}

function formatDate(stringDate) {
    let date = new Date(`${stringDate}T00:00`);
    if (!isValidDate(date)) date = new Date();

    const day = date.getDate().toString().padStart(2, '0'),
        month = (date.getMonth() + 1).toString().padStart(2, '0'),
        year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function isValidDate(date) {
    if (Object.prototype.toString.call(date) === "[object Date]")
        return !isNaN(date.getTime());
    else return false;
}

function generateInvoiceDateAndNumber() {
    let today = new Date();
    let invoiceNumber = `INV${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
    invoice.invoiceNumber = invoiceNumber;
    invoice.date = today;
    document.getElementById('invoiceNumber').value = invoiceNumber;
    document.getElementById('invoiceDate').value = today.toISOString().split('T')[0];
}

function loadFromMemory(inoiceMemo) {
    invoice = JSON.parse(inoiceMemo);
    Object.keys(invoice.business).forEach((key) => {
        document.getElementById(key).value = invoice.business[key]
    });

    Object.keys(invoice.client).forEach((key) => {
        document.getElementById(key).value = invoice.client[key]
    });

    invoiceItems = invoice.items;
    invoice.items = [];
    invoiceItems.forEach(item => {
        addItem(item.description, item.rate, item.quantity, item.amount);
        updateItem(item.id)
    })
    document.getElementById('invoice-notes').value = invoice.invoiceNotes;
    generateInvoiceDateAndNumber();
}

function init() {
    const inoiceMemo = localStorage.getItem('invoice')
    if (inoiceMemo) {
        loadFromMemory(inoiceMemo)

    } else {
        generateInvoiceDateAndNumber();
        addItem();
    }
}

init();