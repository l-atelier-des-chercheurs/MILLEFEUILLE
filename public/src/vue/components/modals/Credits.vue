<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :askBeforeClosingModal="askBeforeClosingModal"
    :typeOfModal="'fullsize'"
    >
    <template slot="header">
      <span class="">crédits</span>
    </template>

    <template slot="preview">
      <div class="margin-medium">
        <div class="margin-bottom-small">
          <label>informations</label>
          <div>
            Ce site présente les productions d’un workshop intitulé <b>« Données situées et cartographie sensible »</b> qui s’est déroulé
            à Stéréolux (Nantes) les 6 et 7 décembre 2018. 
            Pour plus d’informations, consultez <a href="https://www.stereolux.org/agenda/workshop-donnees-situees-et-cartographie-sensible" target="blank">cette page</a>.
          </div>
        </div>

        <div class="margin-bottom-small">
          <label>encadrement</label>
          <div>
            Le workshop a été encadré par l’équipe suivante : <br>• Maryne Buffat (urbaniste) de la revue <a href="http://www.revuesurmesure.fr" target="blank">Sur Mesure</a>,
            <br>• Quentin Lefèvre (designer et urbaniste), <br>• Louis Eveillard (designer interactif) de <a href="https://latelier-des-chercheurs.fr" target="blank">l’Atelier des chercheurs</a>.
          </div>
        </div>

        <div class="margin-bottom-small">
          <label>participants au workshop</label>
          <div>
            Tony Vanpoucke, Raphaëlle Duquesnoy, Carine Salaun, 
            Marie Jolivet, Margaux Leroi, Aurélie Provost, Gautier Haslé, Gilles Morain,
            Perrin Ravatin, Lola Jouault, Pierre Guichon-Reynaert, Lisa Le Gourrierec
          </div>
        </div>
        <div class="margin-bottom-small">
          <label>cet outil</label>
          <div>
            Millefeuille est un nouvel outil expérimenté pendant l’ensemble de ce workshop. C’est une plate-forme collaborative de collecte et mise en 
            commun de données situées. Elle permet également de produire un empilement de calques et de modifier leurs propriétés (couleur, transparence, etc.) pour 
            travailler des représentations graphiques qui mettent en lien des cartes déssinés et des données "factuelles" provenant de différents portails d’open data.<br>
            Millefeuille est créé et développé par <a href="https://latelier-des-chercheurs.fr" target="blank">l’Atelier des chercheurs</a>.
          </div>
        </div>

        <div class="margin-bottom-small">
          <label>license</label>
          <div>
            Sauf mention contraire, l’ensemble des productions présentées sur ce site sont sous license Creative Commons BY-NC-SA. Elles peuvent être présentées et ré-utilisées
            dans n’importe quel cadre, à partir du moment où le crédit original est respecté (un lien vers ce site) et aucune utilisation commerciale n’en est faite. 
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
