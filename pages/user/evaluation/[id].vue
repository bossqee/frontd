<script setup>
definePageMeta({ layout: 'default' })
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const auth = useAuthStore()

console.log(auth.user.u_id)

const items = ref([])
const total = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const confirmDialog = ref(false)
const selectedUser = ref(null)

const t_id = route.params.id

console.log(t_id)
const t_name = ref('')
const ind_id =ref('')
const choose = ref('')

// โหลดข้อมูล
async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get(`/api/topic/list/${t_id}/indicator`)
    console.log(data.item)
    console.log(data.item.list)
    items.value = data.item.list
    t_name.value = data.item.topic.t_name
    ind_id.value = data.item.list.ind_id
    total.value = data.total
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    await $api.post(
      `/api/evaluation/createEvar/${auth.user.u_id}`,
      {
        t_id: t_id,
        ind_id : ind_id.value,
        u_id : auth.user.u_id,
        choose : choose.value
      },
    );
    router.push("/user/list");
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e.message || "Create failed";
  }
};


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
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">หัวข้อ ( {{ t_name }} )</h1>
        <v-btn color="error" @click="logout">ออกจากระบบ</v-btn>
    </div>

    <v-card>
      <v-card-text>
        <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</v-alert>

            <div v-for="(item, index) in items" :key="ind_id">
                <div class="flex justify-between items-center pa-4">
                    <div>
                        <v-card-title>ตัวชี้วัดที่ {{index+1}} {{ item.ind_name }}</v-card-title>
                        <p class="ml-4 mt-2" >{{ item.detail }}</p>
                        <div v-if="item.ind_score === 0" class="px-4">
                            <v-radio-group v-model="choose">
                                <v-radio label="มี" value='4'></v-radio>
                                <v-radio label="ไม่มี" value='0'></v-radio>
                            </v-radio-group>    
                        </div>
                        <div v-if="item.ind_score === 1">
                            <v-select
                                v-model="choose"
                                :items="[
                                    {title : '1' , value : 1},
                                    {title : '2' , value : 2},
                                    {title : '3' , value : 3},
                                    {title : '4' , value : 4},
                                ]"
                                label="ผู้ประมิน"
                                :rules="[rules.select]"
                                density="comfortable" class="mb-3" clearable
                            />
                        </div>
                    </div>
                    <div>
                        <v-card-title>{{ item.score_max }} คะแนน</v-card-title>
                    </div>
                </div>
                <hr class="my-3">
            </div>
      </v-card-text>
      <v-btn
        type="button"
    color="primary"
                  variant="flat"
                  @click="handleSubmit"
                  block
                  rounded="1"
                >
                  บันทึก
                </v-btn>
    </v-card>
  </div>
</template>
