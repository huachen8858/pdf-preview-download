<template>
  <div class="home">
    <section class="heading">
      <h1>PDF Preview & Download</h1>
    </section>
    <!-- Test Data -->
    <section class="container" v-if="pageTab == 1">
      <div class="top">
        <h3>Preview Data:</h3>
        <div class="data-wrapper">
          <pre><code>{{ shippingData }}</code></pre>
        </div>
      </div>
      <div class="bottom">
        <button class="gen-btn" @click="genPLPdf()">Generate PDF</button>
      </div>
    </section>
    <!-- PDF Preview -->
    <section class="container" v-else-if="pageTab == 2">
      <div class="page-two-top">
        <PDFPreview style="width: 80%;" :pdfUrl="pdfUrl" />
      </div>
      <div class="page-two-bottom">
        <button class="back-btn" @click="pageTab = 1">Back</button>
        <button class="download-btn" @click="downloadPDF()">Download</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PDFPreview from "../components/PDFPreview.vue";
import * as PDFService from "../functions/PDF-service.js";

let pageTab = ref(1);
const shippingData = ref({
  sender: {
    name: "Marry",
    email: "marry@test.com",
    address: "台北市大安區仁愛路三段123號5樓",
    company: "Sender Company",
    tel: "02-1234-5678",
  },
  receiver: {
    name: "Tonny",
    email: "tonny@test.com",
    address: "台中市西屯區台灣大道三段789號",
    company: "Receiver Company",
    tel: "04-5678-1234",
  },
  courier: {
    company: "SF",
    trackingNumber: "SF123456789TW",
    date: "2025-01-05 00:00:00",
  },
  shippingItemList: [
    {
      item: "X999-0001",
      prodDescription: ["Desc1", "Desc2", "Desc3"],
      qty: "10",
      weight: "8.2kg",
    },
    {
      item: "X999-0002",
      prodDescription: [
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
      ],
      qty: "6",
      weight: "8.2kg",
    },
    {
      item: "X999-0003",
      prodDescription: ["Test Product"],
      qty: "5",
      weight: "7.4kg",
    },
    {
      item: "X999-0006",
      prodDescription: [
        "when an unknown printer took a galley of type and scrambled it to make a type specimen book",
        "- Test Product 2025-03-19",
        "- Test Product 2025-03-24",
        "- Test Product 2025-04-13",
      ],
      qty: "1",
      weight: "1kg",
    },
    {
      item: "X999-0005",
      prodDescription: [
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
      ],
      qty: "6",
      weight: "8.2kg",
    },
    {
      item: "X999-0004",
      prodDescription: [
        "Test Product",
        "Test Product 124",
        "Test Product 223"
      ],
      qty: "5",
      weight: "7.4kg",
    },
    {
      item: "X999-0010",
      prodDescription: [
        "when an unknown printer took a galley of type and scrambled it to make a type specimen book",
        "- Test Product 2025-03-19",
        "- Test Product 2025-03-24",
        "- Test Product 2025-04-13",
      ],
      qty: "1",
      weight: "1kg",
    },
    {
      item: "X999-0013",
      prodDescription: [
        "when an unknown printer took a galley of type and scrambled it to make a type specimen book",
        "- Test Product 2025-03-24",
      ],
      qty: "1",
      weight: "1kg",
    },
    {
      item: "X999-0019",
      prodDescription: [
        "- Test Product 2025-03-19",
        "- Test Product 2025-04-13",
      ],
      qty: "1",
      weight: "1kg",
    },
    {
      item: "X999-0016",
      prodDescription: ["Test Product"],
      qty: "5",
      weight: "7.4kg",
    },
    {
      item: "X999-0017",
      prodDescription: [
        "when an unknown printer took a galley of type and scrambled it to make a type specimen book",
        "- Test Product 2025-03-19",
        "- Test Product 2025-03-24",
        "- Test Product 2025-04-13",
      ],
      qty: "1",
      weight: "1kg",
    },
    {
      item: "X999-0018",
      prodDescription: [
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
      ],
      qty: "6",
      weight: "8.2kg",
    },
  ],
});

const pdfUrl = ref("");
let pdfName = ref("");

async function genPLPdf() {
  pdfUrl.value = await PDFService.genPLPdf(shippingData.value);
  pdfName.value = `ShippingList-${shippingData.value.PLNo}`;

  pageTab.value = 2;
}

function downloadPDF() {
  if (!pdfUrl.value) {
    alert("No PDF URL available for download.");
    return;
  }

  const link = document.createElement("a");
  link.href = pdfUrl.value;
  link.download = pdfName.value;
  link.click();
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 96%;
}

.heading {
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  width: 90%;
  height: 86%;
  padding: 2% 5%;
}

.top {
  width: 100%;
  height: 90%;
}

.bottom {
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: flex-end;
}

.gen-btn, .download-btn {
  width: 14vw;
  height: 6vh;
  background-color: #45bbab;
  color: #fff;
  letter-spacing: 0.05vw;
  padding: 1% 2%;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-btn {
  width: 14vw;
  height: 6vh;
  background-color: #9b9b9b;
  color: #fff;
  letter-spacing: 0.05vw;
  padding: 1% 2%;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.gen-btn:hover,
.download-btn:hover,
.back-btn:hover {
  box-shadow: 4px 4px 10px rgba(120, 120, 120, 0.1);
}

.data-wrapper {
  width: 100%;
  height: 80%;
  overflow: scroll;
}

.page-two-top {
  width: 100%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-two-bottom {
  width: 100%;
  height: 10%;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
