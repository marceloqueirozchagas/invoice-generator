const divForm = document.getElementById('div-form');
const divPrint = document.getElementById('div-print');
const tableForm = document.getElementById('table-form');

const btnAddItem = document.getElementById('btn-add-item');
const btnPreview = document.getElementById('btn-preview');
const btnPrint = document.getElementById('btn-print');
const btnClose = document.getElementById('btn-close');

btnAddItem?.addEventListener('click', addItem);
btnPreview?.addEventListener('click', previewInvoice);
btnPrint?.addEventListener('click', printInvoice);
btnClose?.addEventListener('click', closePreviewInvoice);

function addItem() {
    const tbody = tableForm.getElementsByTagName('tbody')[0];
    const rowNumber = tbody.rows.length
    const newRow = tbody.insertRow(rowNumber);
    newRow.innerHTML = `
    <tr>
        <td class="td-no-border td-actions">
            <button title="Remove Item" class="btn-add-remove" onclick="removeItem(${rowNumber})">
                <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
                    <path fill="currentColor"
                        d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z">
                    </path>
                </svg>
            </button>
        </td>
        <td class="td-no-border">
            <input type="text" id="input-${rowNumber}-description">
        </td>
        <td class="td-no-border td-rate">
            <input type="text" id="input-${rowNumber}-rate" onkeyup="updateAmount(${rowNumber})">
        </td>
        <td class="td-no-border td-qty">
            <input type="number" id="input-${rowNumber}-quantity" onChange="updateAmount(${rowNumber})" value="1">
        </td>
        <td class="td-no-border td-amount">
            $<span id="span-${rowNumber}-amount">0</span>
        </td>
    </tr>
    `;
}

function removeItem(itemPosition) {
    const tbody = tableForm.getElementsByTagName('tbody')[0];
    if (tbody.rows.length > 1) {
        tbody.rows[itemPosition].remove();
        updateTotal();
    }
}

function updateAmount(id) {
    const inputRate = document.getElementById(`input-${id}-rate`);
    const inputQuantity = document.getElementById(`input-${id}-quantity`);
    const spanAmount = document.getElementById(`span-${id}-amount`);
    spanAmount.innerText = Number(inputRate.value) * Number(inputQuantity.value);
    updateTotal()
}

function updateTotal() {
    const tbody = tableForm.getElementsByTagName('tbody')[0];

    let total = 0;
    Array.from(tbody.rows).forEach((row) => {
        total = total + Number(row.lastElementChild.lastElementChild.textContent)
    })

    const tdTotal = document.getElementById('td-total');
    tdTotal.innerText = total
}

function previewInvoice() {
    divForm.classList.toggle('d-none');
    divPrint.classList.toggle('d-none');
    prepareInvoicePreview()
}

function closePreviewInvoice() {
    divForm.classList.toggle('d-none');
    divPrint.classList.toggle('d-none');
}

function printInvoice() {
    window.print()
}

function prepareInvoicePreview() {
    const arrayFormFrom = Array.from(document.getElementById('form-from'));
    const arrayFormTo = Array.from(document.getElementById('form-to'));
    const mergedArrays = [...arrayFormFrom, ...arrayFormTo];
    mergedArrays.forEach(el => {
        setElementValue(`print-${el.id}`, el.value);
    });

    const invoiceNumber = document.getElementById('invoice-number');
    setElementValue('print-invoice-number', invoiceNumber.value);

    const invoiceDate = document.getElementById('invoice-date');
    setElementValue('print-invoice-date', formatDate(invoiceDate.value));

    const invoiceNotes = document.getElementById('invoice-notes');
    setElementValue('print-invoice-notes', invoiceNotes.value);

    const tdTotal = document.getElementById('td-total');
    setElementValue('print-balance-due', tdTotal.innerText);
    setElementValue('table-print-total', tdTotal.innerText);

    let rowNumber = 0;
    const tbodyRows = Array.from(tableForm.getElementsByTagName('tbody')[0].rows);
    const tablePrint = document.getElementById('table-print').getElementsByTagName('tbody')[0];
    tablePrint.innerHTML = '';

    tbodyRows.forEach((row) => {
        const newRow = tablePrint.insertRow(rowNumber);
        const description = row.children[1].children[0].value;
        const rate = row.children[2].children[0].value;
        const qty = row.children[3].children[0].value;
        const amount = row.children[4].children[0].innerHTML

        newRow.innerHTML = `
        <tr>
            <td>${description}</td>
            <td class="td-rate">$${rate}</td>
            <td class="td-qty">${qty}</td>
            <td class="td-amount">$${amount}</td>
        </tr>`;
        rowNumber++;
    });
}

function setElementValue(elementName, elementValue = '') {
    const element = document.getElementById(elementName)
    element.innerText = elementValue
}

function cleanPrintInvoice() {
    setElementValue('from-name', true)
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
        return !isNaN(date.getTime())
    else return false
}

function init(){
    addItem();
}


init();