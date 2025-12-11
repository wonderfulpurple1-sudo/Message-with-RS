import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `
Anda adalah 'Sistem Rumah Sakit Koordinator Pusat' yang bertugas MENGANALISIS secara KRITIS semua permintaan pengguna dan MENEGASKAN maksud (intent) mereka.

PERAN UTAMA: Tugas Anda adalah secara EKSKLUSIF mendelegasikan permintaan ke SATU Sub-Agen (tool) yang paling sesuai dari daftar di bawah.

ATURAN DELEGASI KETAT:
1. HARUS memilih HANYA SATU fungsi yang relevan per permintaan.
2. JANGAN PERNAH memproses atau menghasilkan jawaban sendiri jika tool yang tersedia relevan.
3. Ekstrak dan sertakan SEMUA detail dan parameter yang relevan dari kueri asli pengguna ke dalam panggilan fungsi.
4. Jika informasi yang diperlukan untuk pemanggilan fungsi tidak lengkap (misalnya, ID pasien hilang), minta informasi yang spesifik dan jelas yang dibutuhkan dengan menjawab dalam teks biasa tanpa memanggil tool.
5. FORMAT ID PASIEN: Pastikan ID Pasien (jika ada) mengikuti format 'P' diikuti 5 digit angka (contoh: P12345).

Sub-agen tersedia:
- PatientManagement: Pendaftaran, pembaruan data, info demografis.
- AppointmentScheduler: Jadwal, batal, ubah janji temu.
- MedicalRecords: Riwayat medis, hasil lab, diagnosis.
- BillingAndInsurance: Keuangan, tagihan, asuransi.
`;

// Tool Definitions mapped to Google GenAI SDK
export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "PatientManagement",
    description: "Mengelola pendaftaran pasien baru, memperbarui informasi kontak, dan mengambil data demografi dasar.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: "Tindakan yang dilakukan (e.g., 'Daftar Baru', 'Update Info', 'Cek Data')" },
        patient_id: { type: Type.STRING, description: "ID Pasien. Format WAJIB: huruf 'P' diikuti 5 digit angka (contoh: P12345). Kosongkan jika pendaftaran baru." },
        patient_details: { type: Type.STRING, description: "Detail pasien seperti nama, alamat, atau data yang ingin diubah." }
      },
      required: ["action"]
    }
  },
  {
    name: "AppointmentScheduler",
    description: "Menangani penjadwalan, penjadwalan ulang, atau pembatalan janji temu.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: "Jenis aksi jadwal (e.g., 'Buat Janji', 'Batal', 'Reschedule')" },
        patient_id: { type: Type.STRING, description: "ID Pasien. Format WAJIB: huruf 'P' diikuti 5 digit angka (contoh: P12345)." },
        appointment_details: { type: Type.STRING, description: "Detail waktu, dokter, atau poli yang dituju." }
      },
      required: ["action", "patient_id", "appointment_details"]
    }
  },
  {
    name: "MedicalRecords",
    description: "Mengambil dan merangkum riwayat medis, hasil lab, diagnosis, dan rencana perawatan.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        patient_id: { type: Type.STRING, description: "ID Pasien." },
        requested_summary_type: { type: Type.STRING, description: "Jenis data medis yang diminta (e.g., 'Hasil Lab', 'Diagnosis', 'Riwayat')." }
      },
      required: ["patient_id", "requested_summary_type"]
    }
  },
  {
    name: "BillingAndInsurance",
    description: "Mengelola pertanyaan penagihan, memproses pembayaran, menghasilkan faktur, serta membantu verifikasi klaim asuransi.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: "Aksi keuangan (e.g., 'Cek Tagihan', 'Bayar', 'Klaim Asuransi')." },
        patient_id: { type: Type.STRING, description: "ID Pasien." },
        financial_details: { type: Type.STRING, description: "Detail nominal atau nomor polis asuransi jika relevan." }
      },
      required: ["action", "patient_id"]
    }
  }
];