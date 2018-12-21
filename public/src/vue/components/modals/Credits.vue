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
            Ce site présente les productions d’un workshop ouvert à tous et intitulé <b>« Données situées et cartographie sensible »</b> qui s’est déroulé
            à Stéréolux, sur l’île de Nantes, les 6 et 7 décembre 2018. 
            Pour plus d’informations, consultez <a href="https://www.stereolux.org/agenda/workshop-donnees-situees-et-cartographie-sensible" target="blank">la page suivante</a>.
          </div>
        </div>

        <div class="margin-bottom-small">
          <label>encadrement</label>
          <div>
            Le workshop a été encadré par l’équipe suivante : 
              <br>• Maryne Buffat, urbaniste et membre du collectif <a href="http://www.revuesurmesure.fr" target="blank">Sur Mesure</a>,
              <br>• <a href="http://quentinlefevre.com/" target="_blank">Quentin Lefèvre</a>, designer et urbaniste spécialisé dans la Cartographie sensible,
              <br>• Louis Eveillard, designer interactif à <a href="https://latelier-des-chercheurs.fr" target="blank">l’Atelier des chercheurs</a>.
          </div>
        </div>

        <div class="margin-bottom-small">
          <label>participants au workshop</label>
          <div>
            Tony Vanpoucke, Raphaëlle Duquesnoy, Carine Salaun, 
            Marie Jolivet, Margaux Leroi, Aurélie Provost, Gautier Haslé, Gilles Morain,
            Perrine Ravatin, Lola Jouault, Pierre Guichon-Reynaert, Lisa Le Gourrierec
          </div>
        </div>
        <div class="margin-bottom-small">
          <label>millefeuille</label>
          <div>
            <b>L’outil que vous consultez actuellement a été utilisé pendant l’ensemble de ce workshop.</b> C’est une plate-forme collaborative de collecte et mise en 
            commun de données situées. Elle permet également de produire un empilement de calques et de modifier leurs propriétés (couleur, transparence, etc.) pour 
            créer des représentations graphiques qui mettent en lien des cartes déssinées et des données "factuelles" provenant de différents portails d’open data.<br>
            Millefeuille a été imaginé, créé et développé par Louis Eveillard de l’Atelier des chercheurs, 
            avec la participation de Maryne Buffat et Louise Robert de la revue d’urbanisme Sur Mesure, et de Quentin Lefèvre, spécialiste en cartographie sensible. 
            Les participants du workshop, par leurs retours et suggestions (possibilité d’importer des fichiers CSV, utilisation de pictogrammes des types de médias 
            à la place des "pins" standards, etc.), ont également participé à cette création pour en faire l’outil que vous avez sous les yeux.
            Millefeuille sera bientôt disponible sur le site de <a href="https://latelier-des-chercheurs.fr" target="blank">l’Atelier des chercheurs</a>.
          </div>
        </div>

        <div class="margin-bottom-small">
          <label>license</label>
          <div>
            Sauf mention contraire, l’ensemble des productions présentées sur ce site sont sous license Creative Commons BY-NC-SA. Elles peuvent être présentées et ré-utilisées
            dans n’importe quel cadre à partir du moment où le crédit original est respecté (à minima un lien vers ce site) et aucune utilisation commerciale n’en est faite.
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
