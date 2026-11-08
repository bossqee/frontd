<script setup>
definePageMeta({ layout: 'default' })
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const search = ref('')
const items = ref([])
const total = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const confirmDialog = ref(false)
const selectedUser = ref(null)
const confirmDialogReset = ref(false)
const selectedUserReset = ref(null)

const u_role = ref('Evaluator')

// โหลดข้อมูล
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get(`api/allusers/list/${u_role.value}`,)
    items.value = data.item
    total.value = data.total
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!auth.isLogged) {
    router.push('/login')
    return
  }
  load()
})

function logout() {
  auth.logout()
  router.push('/login')
}

/* ✅ เรียกตอนกดปุ่ม Delete */
function askDelete(user) {
  selectedUser.value = user
  confirmDialog.value = true
}

/* ✅ เมื่อกดยืนยันใน dialog */
async function confirmDelete() {
  try {
    await $api.delete(`/api/allusers/list/${u_role.value}/${selectedUser.value.u_id}`)
    confirmDialog.value = false
    selectedUser.value = null
    await load()
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Delete failed'
  }
}

/* ✅ เรียกตอนกดปุ่ม Delete */
function askReset(user) {
  selectedUserReset.value = user
  confirmDialogReset.value = true
}

/* ✅ เมื่อกดยืนยันใน dialog */
async function confirmReset() {
  try {
    await $api.delete(`/api/allusers/resetPw/${selectedUserReset.value.u_id}`)
    confirmDialogReset.value = false
    selectedUserReset.value = null
    await load()
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Delete failed'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4 gap-3">
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/evaluator/create">
          <v-btn color="primary" variant="elevated">เพิ่มผู้ประเมิน</v-btn>
        </NuxtLink>
      </div>

      <div class="flex items-center gap-3">
        <v-text-field v-model="search" label="Search" density="comfortable" hide-details />
        <v-btn color="error" @click="logout">ออกจากระบบ</v-btn>
      </div>
    </div>

    <v-card>
      <v-card-title class="text-lg">รายชื่อผู้ประเมิน</v-card-title>
      <v-card-text>
        <v-alert
          v-if="errorMsg"
          type="error"
          variant="tonal"
          class="mb-3"
        >
          {{ errorMsg }}
        </v-alert>

        <v-data-table-server
          :items-length="total"
          :items="items"
          :loading="loading"
          :headers="[
            { title:'ลำดับ', key:'index' },
            { title:'ชื่อ', key:'u_name' },
            { title:'อีเมล', key:'u_email' },
            { title:'บทบาท', key:'u_role' },
            { title:'Actions', key:'actions', sortable:false }
          ]"
        >
        <template #item.index="{index}">{{ index+1 }}</template>
          <template #item.actions="{ item }">
            <NuxtLink :to="`/admin/evaluator/edit/${item.u_id}`">
              <v-btn size="small" variant="text">แก้ไข</v-btn>
            </NuxtLink>
            <v-btn
              size="small"
              color="error"
              variant="text"
              @click="askReset(item)"
            >
              รีเซ็ตรหัสผ่าน
            </v-btn>
            <v-btn
              size="small"
              color="error"
              variant="text"
              @click="askDelete(item)"
            >
              ลบ
            </v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- ✅ Dialog Confirm Delete -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">ยืนยันการลบ</v-card-title>
        <v-card-text>
          ต้องการลบผู้ใช้<strong>({{ selectedUser?.u_name }})</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">ยกเลิก</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">ลบ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDialogReset" max-width="400">
      <v-card>
        <v-card-title class="text-h6">ยืนยันการรีเซ็ตรหัสผ่าน</v-card-title>
        <v-card-text>
          ต้องการรีเซ็ตรหัสผ่านของ<strong>({{ selectedUserReset?.u_name }})</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialogReset = false">ยกเลิก</v-btn>
          <v-btn color="error" variant="flat" @click="confirmReset">รีเซ็ต</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
