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
const t_id = ref('')

// โหลดข้อมูล
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get(`api/evaluation/list/${auth.user.u_id}`,)
    console.log(data.item)
    t_id.value = data.item.t_id
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

</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4 gap-3">
      <div class="flex items-center gap-3">
      </div>

      <div class="flex items-center gap-3">
        <v-text-field v-model="search" label="Search" density="comfortable" hide-details />
        <v-btn color="error" @click="logout">ออกจากระบบ</v-btn>
      </div>
    </div>

    <v-card>
      <v-card-title class="text-lg">รายการประเมิน</v-card-title>
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
            { title:'หัวข้อประเมิน', key:'t_name' },
            { title:'Actions', key:'actions', sortable:false }
          ]"
        >
        <template #item.index="{index}">{{ index+1 }}</template>
          <template #item.actions="{ item }">
            <NuxtLink :to="`/user/evaluation/${item.t_id}`">
              <v-btn size="small" variant="text">ประเมิน</v-btn>
            </NuxtLink>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </div>
</template>
