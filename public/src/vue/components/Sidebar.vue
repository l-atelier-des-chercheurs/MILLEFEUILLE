<template>
  <div class="sidebar" style="">
    <h1>cartographie sensible</h1>
    <button type="button" @click="$root.setPersp()" v-html="'Perspective'"/>
    <h2>Liste des calques</h2>
    <Container @drop="onDrop" drag-handle-selector=".column-drag-handle">
      <Draggable v-for="layer in layers" :key="layer.filename">
        <div class="draggable-item">
          <span class="column-drag-handle" :style="`background-image: url(${baseUrl}layers/${layer.filename})`">
            &#x2630;
          </span>
          <input type="checkbox" v-model="layer.active" />
          <span class="item-name" v-html="layer.name" />
          <input type="range" v-if="layer.active" v-model="layer.opacity" min=0 max=1 step=0.01 />
        </div>
      </Draggable>
    </Container>
  </div>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd'

const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult
  if (removedIndex === null && addedIndex === null) return arr

  const result = [...arr]
  let itemToAdd = payload

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0]
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd)
  }

  return result
}


export default {
  name: 'SimpleScroller',
  props: ['layers'],

  components: {
    Container, 
    Draggable
  },

  data () {
    return {
      baseUrl: process.env.BASE_URL,
    }
  },

  methods: {
    onDrop (dropResult) {
      // this.$root.layers = applyDrag(this.$root.layers, dropResult)
    }
  }
}



</script>
<style lang="less">
.sidebar {
  position: relative;
  flex: 0 0 320px;
  max-width: 320px;
  min-width: 320px;
  padding: 1em;

  overflow: auto;
  height: 100%;
}

.draggable-item {
    height: 3em;
    text-align: left;
    width: 100%;
    display: block;
    background-color: #fff;
    outline: 0;

    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;

    margin-bottom: 4px;
    margin-top: 2px;
    cursor: default;
    -webkit-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
}

.column-drag-handle {
  position: relative;
  background-color: #fff;
  color: #000;
  text-shadow: 0px 0px 4px white;
  background-size: cover;
  overflow: hidden;
  flex: 0 0 3em;
  cursor: move;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
}

.item-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  // padding: 1em;
  text-align: left;
  flex: 1 1 auto;
  padding: 0 1em;
}

input[type="checkbox"] {
}
input[type="range"] {
  max-width: 50px;
}

h2 {
  font-size:1em;
  text-align: left;
}

</style>