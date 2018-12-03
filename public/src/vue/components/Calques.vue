<template>
  <div class="m_calques"
    :class="{ 'is_persp' : $root.is_persp }"
  >
    <Calque 
      v-for="layer in layers_in_order" 
      :key="layer.slugFolderName"
      :layer="layer"
    />
  </div>
</template>
<script>
import Calque from './Calque.vue'

export default {
  props: ['layers'],
  components: {
    Calque
  },
  data() {
    return {
      baseUrl: process.env.BASE_URL,
    }
  },
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    layers_in_order() {
      return this.layers;      
    },
  },
  methods: {
  }
}
</script>
<style lang="less">
.calques {
  margin: auto;

  position: relative;
  overflow: visible;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  // margin-top: 10em;

  &.is_persp {
    .face, .shadow {
      transform: rotateX(45deg) rotateZ(-45deg);
      transform-style: preserve-3d;  
      z-index: -1;
      // box-shadow: -60px 60px 15px #eee;    
    }

  }  

}

.box {
  position: absolute;
  width: 90%;

  transform-origin: center 100%;
  transform: translate3d(0,0px,0) scale(1);
  transition: all 0.6s ease-in-out;

  // opacity: .4;

  &::before {
    content: '';
    display: block;
    position: relative;
    width: 100%;
    padding-bottom: 70.7%;
  }

  .face,
  .shadow {
    position: absolute;
    top: 0;
    width: 100%;
    border: 1px solid #ccc;
    transform: rotateX(0) rotateZ(0) scale(1);
    transition: all 0.6s ease-in-out;      
  }

  img {
    width: 100%;
  }
  
  .shadow {
    box-shadow: 0 0 15px #ccc;    
  }
  
}

.shadow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}

.face {
  
  @thickness: 5px;
  @color: #ff0000;
  
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  // background-color: #ccc;
  background-color: rgba(255,255,255,.2);
  margin: 0 auto;  

  img {
    object-fit: contain;
  }
  
  // &:before {
  //   content: "";
  //   position: absolute;
  //   bottom: -@thickness / 2;
  //   left: 0;
  //   background-color: @color;
  //   width: 100%;
  //   height: @thickness;
  //   display: block;
  //   transform: rotateX(90deg) translateY(-@thickness / 2);
  // }
  
  // &:after {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: -@thickness / 2;
  //   width: @thickness;
  //   height: 100%;
  //   background-color: darken(@color, 10%);
  //   transform: rotateY(90deg) translateX(@thickness / 2);
  // }
}

</style>