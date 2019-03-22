<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :askBeforeClosingModal="askBeforeClosingModal"
    :typeOfModal="'fullsize'"
    >
    <template slot="header">
      <span class="">informations</span>
    </template>

    <template slot="preview">
      <div class="margin-medium">
        <div class="margin-bottom-small">
          <label>informations</label>
          <div>
            Ce site présente les productions du groupe "Défi déplacement" qui s’est constitué lors du Dataviz Challenge au lab 110bis, les 22 et 23 mars 2019.
          </div>
        </div>

        <div class="margin-bottom-small">
          <label>millefeuille</label>
          <div>
            Millefeuille a été imaginé, créé et développé par Louis Eveillard de l’<a href="https://latelier-des-chercheurs.fr" target="_blank">Atelier des chercheurs</a>, avec la participation de Maryne Buffat et Louise Robert de la revue d’urbanisme Sur Mesure, et de Quentin Lefèvre, spécialiste en cartographie sensible.
          </div>
        </div>

        <div class="margin-bottom-small">
          <label>contact</label>
          <div>
            Ce site est hébergé et maintenu par l’Atelier des chercheurs: <a href="mailto:info@latelier-des-chercheurs.fr" target="_blank">info@latelier-des-chercheurs.fr</a>.
          </div>
        </div>
      </div>

    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';

export default {
  props: {
    read_only: Boolean
  },
  components: {
    Modal,
  },
  data() {
    return {
    };
  },
  watch: {
  },
  computed: {
  },
  methods: {
  }
};
</script>
<style>

</style>
