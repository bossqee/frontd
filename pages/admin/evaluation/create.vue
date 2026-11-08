<!-- pages/upload.vue -->
<script setup>
import { split } from 'postcss/lib/list'
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuthStore()

const loading = ref(false)
const errorMsg = ref('')

const User = ref([])
const Evaluator = ref([])
const Topic = ref([])
const select_eva = ref([])

const vals = ref({
  date_start: null,
  date_end: null,
  user_id: null,
  t_id: null,
  evaluator_id: null,        // เฉพาะ evaluator; evaluatee จะถูกอิงจาก JWT ฝั่ง server
  right: null
})

const rules = {
  required: v => (!!v || v === 0) || 'กรอกข้อมูลให้ครบ',
  select: v => !!v || 'โปรดเลือก',
}

const u_role_eva = ref('Evaluator')
const u_role_u = ref('User')


async function loadUser() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get(`api/allusers/list/${u_role_u.value}`,)
    console.log(data.item)
    User.value = data.item
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

async function loadEvaluator() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get(`api/allusers/list/${u_role_eva.value}`,)
    console.log(data.item)
    Evaluator.value = data.item
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

async function loadTopic() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await $api.get(`api/topic/list/`,)
    console.log(data.item)
    Topic.value = data.item
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

const addEvaluator = async () => {
    const Evaluators = Evaluator.value.find(
        item => item.u_id === vals.value.evaluator_id
    )

    select_eva.value.push({
        evaluator_id : Evaluators.u_id,
        evaluator_name : Evaluators.u_name,
        right : vals.value.right
    })

    vals.value.evaluator_id = null
    vals.value.right = null
}

const handleSubmit = async () => {
  try {

    const payload = {
        date_start : vals.value.date_start,
        date_end : vals.value.date_end,
        t_id : vals.value.t_id,

        evauser : [
            {u_id : vals.value.user_id , evau_role : 'U'},
            
            ...select_eva.value.map(item => ({
                u_id : item.evaluator_id,
                evau_role : item.right,
            }))
        ]
    }
    console.log(payload)
    await $api.post(
      `/api/evaluation/create`, payload);
    router.push("/admin/evaluator/evaluator_list");
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e.message || "Create failed";
  }
};

onMounted(() => {
  if (!auth.isLogged) {
    router.push('/login')
    return
  }
  loadUser()
  loadEvaluator()
  loadTopic()
})

</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">สร้างแบบประเมิน</h1>
      <NuxtLink to="/users">
        <v-btn variant="text">Back</v-btn>
      </NuxtLink>
    </div>

    <v-card>
      <v-card-text>
        <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</v-alert>
        <v-skeleton-loader v-if="loadingInit" type="article" class="mb-4"/>

        <div class="grid md:grid-cols-2 gap-6">
            <v-text-field
                label="เริ่มการประเมิน"
                type="date"
                v-model="vals.date_start"
                variant="outlined"
                clearable
                required
            />
            <v-text-field
                label="สิ้นสุดการประเมิน"
                type="date"
                v-model="vals.date_end"
                variant="outlined"
                clearable
                required
            />

            <v-select
              v-model="vals.user_id"
              :items="User"
              item-title="u_name"
              item-value="u_id"
              label="ผู้รับการประเมิน"
              :rules="[rules.select]"
              density="comfortable" class="mb-3" clearable
            />
            <v-select
              v-model="vals.t_id"
              :items="Topic"
              item-title="t_name"
              item-value="t_id"
              label="หัวข้อการประเมิน"
              :rules="[rules.select]"
              density="comfortable" class="mb-3" clearable
            />
            <v-select
              v-model="vals.evaluator_id"
              :items="Evaluator"
              item-title="u_name"
              item-value="u_id"
              label="ผู้ประมิน"
              :rules="[rules.select]"
              density="comfortable" class="mb-3" clearable
            />
            <v-select
              v-model="vals.right"
              :items="[
                {title : 'ประธาน' , value : 'T'},
                {title : 'กรรมการ' , value : 'K'},
              ]"
              label="ตำแหน่ง"
              :rules="[rules.select]"
              density="comfortable" class="mb-3" clearable
            />

            <v-btn
                  type="button"
                  color="primary"
                  variant="outlined"
                  @click="addEvaluator"
                  block
                  rounded="1"
                >
                  เพิ่มผู้ประเมิน
            </v-btn>
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
            
        </div>
      </v-card-text>
      <div v-for="(item,index) in select_eva" :key="evaluator_id">
        <div class="flex justify-between items-center pa-3">
            <div>
                {{ index+1 }}
            </div>
            <div>
                {{ item.evaluator_name }}
            </div>
            <div>
                {{ item.right === 'T' ? 'ประธาน' :'กรรมการ' }}
            </div>
            <div>
                <v-btn
                  type="button"
                  color="error"
                  variant="outlined"
                  @click="select_eva.splice(index , 1)"
                  block
                  rounded="1"
                >
                  บันทึก
            </v-btn>
            </div>
        </div>
      </div>
    </v-card>
  </div>
</template>
