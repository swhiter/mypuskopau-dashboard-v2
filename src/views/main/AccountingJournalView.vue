<template>
  <PageContainer :title="$t('title.journal')">
    <PageCard>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <input v-model="filters.from" type="date" class="filter" :min="OPENING_DATE" @change="load" />
          <span>-</span>
          <input v-model="filters.to" type="date" class="filter" :min="OPENING_DATE" @change="load" />
          <select v-model="filters.type" class="filter" @change="load">
            <option value="">Semua jenis</option>
            <option v-for="(label, key) in JOURNAL_TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
          <select v-model="filters.unit" class="filter" @change="load">
            <option value="">Semua unit</option>
            <option v-for="unit in UNITS" :key="unit" :value="unit">{{ UNIT_LABELS[unit] }}</option>
          </select>
          <button v-if="canWrite" class="btn-primary ml-auto" @click="openForm">+ Jurnal Baru</button>
        </div>

        <!-- Form jurnal manual -->
        <div v-if="form" class="rounded-lg border border-gray-200 p-4 space-y-3">
          <p class="font-semibold">Jurnal baru</p>
          <div class="flex flex-wrap gap-3">
            <input v-model="form.journalDate" type="date" class="filter" :min="OPENING_DATE" :max="today" />
            <select v-model="form.type" class="filter">
              <option v-for="type in FORM_JOURNAL_TYPES" :key="type" :value="type">{{ JOURNAL_TYPE_LABELS[type] }}</option>
            </select>
            <input v-model="form.description" class="filter flex-1 min-w-[16rem]" placeholder="Keterangan (mis. Penyusutan kendaraan November)" />
          </div>
          <table class="w-full text-sm report">
            <thead>
              <tr>
                <th>Akun</th>
                <th>Unit</th>
                <th class="num">Debit</th>
                <th class="num">Kredit</th>
                <th>Catatan</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(line, index) in form.lines" :key="index">
                <td>
                  <select v-model="line.coaCode" class="filter w-full">
                    <option value="">Pilih akun</option>
                    <option v-for="account in accountChoices" :key="account.code" :value="account.code">
                      {{ account.code }} {{ account.name }}
                    </option>
                  </select>
                </td>
                <td>
                  <select v-model="line.unit" class="filter">
                    <option v-for="unit in UNITS" :key="unit" :value="unit">{{ UNIT_LABELS[unit] }}</option>
                  </select>
                </td>
                <td><input v-model="line.debit" type="number" min="0" step="0.01" class="filter w-36 text-right" /></td>
                <td><input v-model="line.credit" type="number" min="0" step="0.01" class="filter w-36 text-right" /></td>
                <td><input v-model="line.memo" class="filter w-full" /></td>
                <td>
                  <button v-if="form.lines.length > 2" class="text-red-600" @click="form.lines.splice(index, 1)">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="flex flex-wrap items-center gap-3 text-sm">
            <button class="underline" @click="addLine">+ Baris</button>
            <span v-for="(diff, unit) in diffs" :key="unit" :class="diff === 0 ? 'text-green-700' : 'text-red-600'">
              {{ UNIT_LABELS[unit as BusinessUnit] }}: {{ diff === 0 ? 'balance ✓' : `selisih ${formatRupiah(diff)}` }}
            </span>
            <span class="ml-auto"></span>
            <button class="px-3 py-2" @click="form = null">Batal</button>
            <button class="btn-primary" :disabled="!ready || saving" @click="save">Simpan</button>
          </div>
          <p class="text-xs text-accentGray">
            Akun kas & bank tidak bisa dipakai di jurnal setelah 1 Nov 2026; catat lewat Dashboard Kas. Jurnal tidak bisa diubah:
            jika salah, VOID lalu buat ulang.
          </p>
        </div>

        <table class="w-full text-sm report">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>No.</th>
              <th>Jenis</th>
              <th>Keterangan</th>
              <th>Unit</th>
              <th class="num">Jumlah</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="journal in journals" :key="journal.id">
              <tr :class="journal.status === 'VOID' ? 'text-gray-400 line-through' : ''">
                <td>{{ formatWorkDate(journal.journalDate) }}</td>
                <td>J-{{ journal.id }}</td>
                <td>{{ JOURNAL_TYPE_LABELS[journal.type] }}</td>
                <td>
                  <button class="link text-left" @click="toggle(journal.id)">{{ journal.description }}</button>
                </td>
                <td>{{ journal.units }}</td>
                <td class="num">{{ formatRupiah(journal.total ?? 0) }}</td>
                <td>{{ journal.status === 'VOID' ? `VOID: ${journal.voidReason}` : 'Aktif' }}</td>
                <td>
                  <button v-if="canWrite && journal.status === 'ACTIVE'" class="text-red-600" @click="voidJournal(journal.id)">VOID</button>
                </td>
              </tr>
              <tr v-if="opened === journal.id && detail">
                <td colspan="8" class="bg-gray-50">
                  <table class="w-full text-xs">
                    <tr v-for="line in detail.lines" :key="line.lineNo">
                      <td class="pl-6">{{ line.coaCode }} {{ line.coaName }}</td>
                      <td>{{ line.unit }}</td>
                      <td class="num">{{ line.debit ? formatRupiah(line.debit) : '' }}</td>
                      <td class="num">{{ line.credit ? formatRupiah(line.credit) : '' }}</td>
                      <td>{{ line.memo }}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </template>
            <tr v-if="!journals.length">
              <td colspan="8" class="text-center text-accentGray">Belum ada jurnal manual pada rentang ini.</td>
            </tr>
          </tbody>
        </table>
        <p class="text-xs text-accentGray">
          Daftar ini berisi jurnal manual (saldo awal, riwayat Excel Sep–Okt, penyesuaian, koreksi). Jurnal otomatis dari order,
          kas, penggajian dan hutang driver tampil di Buku Besar.
        </p>
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import { getCurrentUser, handleErrorResponse } from '@/utils/common'
import { formatRupiah, formatWorkDate } from '@/utils/payroll-format'
import { todayWib } from '@/utils/cash-labels'
import { UNITS, UNIT_LABELS, type BusinessUnit, type CoaAccount } from '@/utils/accounting'
import {
  FORM_JOURNAL_TYPES,
  GL_AUTO_START,
  JOURNAL_TYPE_LABELS,
  OPENING_DATE,
  journalReady,
  journalUnitDiffs
} from '@/utils/accounting-report'
import accountingService, { type Journal, type JournalType } from '@/services/accounting/accounting.api'

interface FormLine {
  coaCode: string
  unit: BusinessUnit
  debit: string
  credit: string
  memo: string
}

const canWrite = getCurrentUser().role === 'bendahara'
const today = todayWib()
const filters = ref({ from: OPENING_DATE, to: today, type: '' as JournalType | '', unit: '' as BusinessUnit | '' })
const journals = ref<Journal[]>([])
const accounts = ref<CoaAccount[]>([])
const opened = ref<number | null>(null)
const detail = ref<Journal | null>(null)
const saving = ref(false)
const form = ref<{ journalDate: string; type: JournalType; description: string; lines: FormLine[] } | null>(null)

const emptyLine = (): FormLine => ({ coaCode: '', unit: 'INVESTOR', debit: '', credit: '', memo: '' })

// Akun kas hanya boleh di jurnal sebelum jurnal otomatis (1 Nov); setelahnya lewat Dashboard Kas.
const accountChoices = computed(() =>
  accounts.value.filter(
    (account) =>
      !account.isHeader &&
      account.isActive &&
      (!account.cashAccount || (form.value?.journalDate ?? today) < GL_AUTO_START)
  )
)
const diffs = computed(() => journalUnitDiffs(form.value?.lines ?? []))
const ready = computed(() => !!form.value?.description.trim() && journalReady(form.value?.lines ?? []))

const load = async (): Promise<void> => {
  try {
    journals.value = (await accountingService.getJournals(filters.value)).data
  } catch (error) {
    handleErrorResponse(error)
  }
}

const toggle = async (id: number): Promise<void> => {
  if (opened.value === id) {
    opened.value = null
    return
  }
  try {
    detail.value = (await accountingService.getJournal(id)).data
    opened.value = id
  } catch (error) {
    handleErrorResponse(error)
  }
}

const openForm = async (): Promise<void> => {
  if (!accounts.value.length) {
    try {
      accounts.value = (await accountingService.getAccounts()).data
    } catch (error) {
      handleErrorResponse(error)
      return
    }
  }
  form.value = { journalDate: today, type: 'PENYESUAIAN', description: '', lines: [emptyLine(), emptyLine()] }
}

const addLine = (): void => {
  form.value?.lines.push(emptyLine())
}

const save = async (): Promise<void> => {
  if (!form.value || !ready.value) return
  saving.value = true
  try {
    await accountingService.createJournal({
      journalDate: form.value.journalDate,
      type: form.value.type,
      description: form.value.description.trim(),
      lines: form.value.lines.map((line) => ({
        coaCode: line.coaCode,
        unit: line.unit,
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0,
        memo: line.memo.trim() || null
      }))
    })
    form.value = null
    await load()
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    saving.value = false
  }
}

const voidJournal = async (id: number): Promise<void> => {
  const reason = window.prompt(`Alasan VOID jurnal J-${id} (minimal 5 karakter):`)
  if (!reason) return
  try {
    await accountingService.voidJournal(id, reason)
    await load()
  } catch (error) {
    handleErrorResponse(error)
  }
}

onMounted(load)
</script>

<style scoped>
.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.btn-primary {
  @apply rounded-lg bg-primaryDarkBlue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50
}

.report td,
.report th {
  @apply px-3 py-1.5 text-left border-b border-gray-100
}

.report thead {
  @apply bg-gray-100
}

.num {
  @apply text-right whitespace-nowrap
}

.link {
  @apply text-primaryDarkBlue underline
}
</style>
