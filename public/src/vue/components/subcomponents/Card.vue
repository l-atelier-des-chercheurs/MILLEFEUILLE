<template>
  <div class="card padding-left-medium padding-top-small" :class="type">
    <div class="card--header">
        <slot name="header">
          <template v-if="!!variable">
            <span class="titre">
              <transition name="iconSlide">
                <span  @click="reset" title="Valeur par défaut">
                  <svg v-if="isDynamicValueWithDefault && !valueIsDefault" class="svg-icon svg-icon_close" viewBox="0 0 20 20" >
                    <path fill="none" d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"></path>
                  </svg>   
                </span>
              </transition>           
              {{ variable.label }}
            </span>
            <template v-if="variable.field_type === 'slider'">
              <input 
                type="number" 
                :step="step"
                :value="myval" 
                @input="updateLocalValue(Number($event.target.value))"
                @keyup="updateAndEmitValue(Number($event.target.value))"
              >
            </template>
            <template v-if="variable.field_type === 'toggle'">
              <label class="switch">
                <input 
                  type="checkbox" 
                  v-model="checkbox_status"
                >
                <span class="slider"></span>
              </label>
            </template>
            <template v-if="variable.field_type === 'color'">
              <input 
                type="color"
                :value="myval" 
                @input="updateAndEmitValue(String($event.target.value))"
              >
            </template>
          </template>
        </slot>
    </div>
    <div class="card--body">
      <slot name="body">
        <template v-if="!!variable && variable.field_type === 'slider'">
          <input 
            type="range" 
            :step="step"
            :value="myval" 
            @input="updateLocalValue(Number($event.target.value))"
            @change="updateAndEmitValue(Number($event.target.value))"
            :min="variable.min" 
            :max="variable.max"
          >
        </template>
        <template v-if="!!variable && variable.field_type === 'select'">
          <select 
            :value="myval"
            @change="updateAndEmitValue(String($event.target.value))"   
          >
            <!-- inline object literal -->
            <option 
              v-for="field in variable.field_options"         
              :value="field.key"
              :key="field.key"
            >
              {{ field.name }}
            </option>
          </select>          
        </template>
        <template v-if="!!variable && variable.field_type === 'textarea'">
          <textarea 
            :value="myval" 
            @input="updateAndEmitValue(String($event.target.value))"
          />
        </template>        
      </slot>
    </div>
    <div v-if="!!this.$slots['footer']" class="card--footer">
      <div class="card--footer--container">
        <slot name="footer">
          <!-- <button type="button" v-if="isDynamicValueWithDefault" class="btn_small" @click="reset">
            Remise à zéro
          </button>
          <button type="button" v-if="isDynamicValueWithMinMax" class="btn_small" @click="random">
            Aléatoire
          </button> -->
        </slot>
      </div>
    </div>
  </div>
</template>
<script>


export default {
  props: [ 'value', 'variable', 'type' ],
  components: {
  },
  data() {
    return {
      myval: this.value,
      checkbox_status: ''
    }
  },
  
  created() {
  },
  mounted() {
    if(this.isDynamicValueWithDefault && this.myval === undefined) {
      this.myval = this.variable.default;
    }
    if(this.variable !== undefined && this.variable.field_type === 'toggle') {
      this.checkbox_status = this.myval;
    }
    this.emitValue();
  },
  beforeDestroy() {
  },

  watch: {
    'value': function() {
      console.log(`Card / watch : value = ${this.value}`);
      this.myval = this.saniziteValue(this.value);
    },
    'myval': function() {
      console.log(`Card / watch : myval = ${this.myval}`);
      // this.myval = this.saniziteValue(this.myval);
      if(this.variable !== undefined && this.variable.field_type === 'toggle') {
        this.checkbox_status = this.myval;
      }
    },
    'checkbox_status': function() {
      this.updateAndEmitValue(this.checkbox_status);
    }
  },
  computed: {
    isDynamicValueWithDefault: function() {
      return this.variable !== undefined && this.variable.hasOwnProperty('default');
    },
    valueIsDefault: function() {
      return this.myval === this.variable.default;
    },
    isDynamicValueWithMinMax: function() {
      return this.value === undefined && this.variable !== undefined && this.variable.hasOwnProperty('min') && this.variable.hasOwnProperty('max');
    },
    step: function() {
      if(this.variable !== undefined && this.variable.hasOwnProperty('step')) {
        return this.variable.step;
      }
      return 1; 
     }
  },
  methods: {
    saniziteValue: function(val) {
      console.log(`Card / saniziteValue : ${val}`);
      if(this.variable !== undefined && this.variable.min !== undefined && this.variable.max !== undefined) {
        val = Math.min(this.variable.max, Math.max(this.variable.min, val));;
      }
      if(this.variable !== undefined && this.variable.field_type === 'toggle') {
        val = val == 'true' || val == true ? true:false;
      }
      if(this.variable !== undefined && this.variable.field_type === 'select') {
        val = String(val);
      }
      return val;
    },
    updateLocalValue: function(val) {
      this.myval = val;
    },
    updateAndEmitValue: function(val) {
      console.log(`Card / updateAndEmitValue : ${val}`);
      val = this.saniziteValue(val);
      this.updateLocalValue(val);
      this.emitValue();
    },
    emitValue: function() {
      // console.log(`Card / emitValue : this.myval = ${this.myval}`);
      this.$nextTick(() => this.$emit('input', this.myval));
    },
    reset: function() {
      this.myval = this.variable.default;
      this.emitValue();
    },
    random: function() {
      this.myval = getRandomInt(this.variable.min, this.variable.max);
      this.emitValue();
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


</script>
<style lang="sass" scoped>
</style>