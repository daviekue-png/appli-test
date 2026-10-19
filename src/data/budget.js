/**
 * Lignes budgétaires de l'exercice 2026.
 * Source : budget-Budget-2026-2026.xlsx (feuille « Budget », statut DRAFT).
 *
 * Hiérarchie : section (Recettes / Dépenses) > catégorie budgétaire > ligne.
 * Aucun montant n'est repris ici : chaque catégorie et chaque ligne porte un
 * `detail` qui décrit ce qu'elle couvre.
 * Les lignes marquées `suggested: true` sont des compléments cohérents avec le
 * contexte, absents du fichier d'origine.
 */
export const BUDGET = {
  organisation: 'Église Évangélique des Assemblées de Dieu du Bénin',
  identification: 'N° 1674/APA/EEAD/MAD-30-9-1947',
  entite: 'Église',
  exercice: 2026,
  statut: 'DRAFT',
  devise: 'FCFA',
  source: 'budget-Budget-2026-2026.xlsx',
}

export const SECTIONS = [
  { value: 'recettes', label: 'Recettes', prefix: 'REC' },
  { value: 'depenses', label: 'Dépenses', prefix: 'DEP' },
]

export const CATEGORIES = [
  /* ------------------------------------------------------------- RECETTES */
  {
    value: 'rec-dimes',
    code: 'REC-01',
    section: 'recettes',
    label: 'Dîmes et offrandes régulières',
    detail: 'Collectes régulières des cultes',
    keywords: 'dime offrande culte cotisation membre',
    subCategories: [
      {
        value: 'rec-dimes-01',
        code: 'REC-01-01',
        label: 'Dîmes',
        detail: 'Dîmes mensuelles des membres',
      },
      {
        value: 'rec-dimes-02',
        code: 'REC-01-02',
        label: 'Offrandes ordinaires',
        detail: 'Offrandes des cultes ordinaires',
      },
      {
        value: 'rec-dimes-03',
        code: 'REC-01-03',
        label: 'Offrande spéciale',
        detail: 'Offrandes spéciales demandées au culte',
      },
      {
        value: 'rec-dimes-04',
        code: 'REC-01-04',
        label: 'Offrandes de la Sainte Cène',
        detail: 'Collecte lors de la Sainte Cène',
        suggested: true,
      },
      {
        value: 'rec-dimes-05',
        code: 'REC-01-05',
        label: 'Offrandes des veillées et cultes de nuit',
        detail: 'Collectes des veillées de prière',
        suggested: true,
      },
    ],
  },
  {
    value: 'rec-speciales',
    code: 'REC-02',
    section: 'recettes',
    label: 'Offrandes spéciales',
    detail: 'Collectes des fêtes et des départements',
    keywords: 'noel paques fetes departement femmes jeunes',
    subCategories: [
      {
        value: 'rec-speciales-01',
        code: 'REC-02-01',
        label: 'Contributions et cotisations des membres',
        detail: 'Cotisations régulières des membres',
      },
      {
        value: 'rec-speciales-02',
        code: 'REC-02-02',
        label: 'Offrandes de la fête de Noël',
        detail: 'Collecte du culte de fin d’année',
        suggested: true,
      },
      {
        value: 'rec-speciales-03',
        code: 'REC-02-03',
        label: 'Offrandes de la fête de Pâques',
        detail: 'Collecte de la fête de Pâques',
        suggested: true,
      },
      {
        value: 'rec-speciales-04',
        code: 'REC-02-04',
        label: 'Contributions des départements (femmes, jeunes, enfants)',
        detail: 'Versements des départements à l’église',
        suggested: true,
      },
    ],
  },
  {
    value: 'rec-dons',
    code: 'REC-03',
    section: 'recettes',
    label: 'Dons, offrandes spéciales et subventions des départements',
    detail: 'Soutiens extérieurs et dons reçus',
    keywords: 'don partenaire legs missionnaire oeuvre',
    subCategories: [
      {
        value: 'rec-dons-01',
        code: 'REC-03-01',
        label: 'Dons de partenaires',
        detail: 'Dons des partenaires et églises sœurs',
      },
      {
        value: 'rec-dons-02',
        code: 'REC-03-02',
        label: 'Dons des œuvres et missionnaires partenaires',
        detail: 'Soutiens des œuvres missionnaires',
        suggested: true,
      },
      {
        value: 'rec-dons-03',
        code: 'REC-03-03',
        label: 'Legs et dons exceptionnels',
        detail: 'Dons ponctuels reçus par l’église',
        suggested: true,
      },
    ],
  },
  {
    value: 'rec-subventions',
    code: 'REC-04',
    section: 'recettes',
    label: 'Subventions',
    detail: 'Recettes d’activités et appuis reçus',
    keywords: 'subvention librairie restauration kiosque location salle',
    subCategories: [
      {
        value: 'rec-subventions-01',
        code: 'REC-04-01',
        label: 'Produits d’activités (librairie, restauration)',
        detail: 'Recettes de la librairie et de la restauration',
      },
      {
        value: 'rec-subventions-02',
        code: 'REC-04-02',
        label: 'Subvention de la section et de la région',
        detail: 'Appuis financiers de la section et de la région',
        suggested: true,
      },
      {
        value: 'rec-subventions-03',
        code: 'REC-04-03',
        label: 'Location de la salle aux associations',
        detail: 'Mise à disposition de la salle',
        suggested: true,
      },
    ],
  },
  {
    value: 'rec-financiers',
    code: 'REC-05',
    section: 'recettes',
    label: 'Produits financiers et divers',
    detail: 'Produits financiers et exceptionnels',
    keywords: 'interet banque placement exceptionnel remboursement',
    subCategories: [
      {
        value: 'rec-financiers-01',
        code: 'REC-05-01',
        label: 'Intérêts bancaires et produits de placement',
        detail: 'Intérêts du compte et des placements',
        suggested: true,
      },
      {
        value: 'rec-financiers-02',
        code: 'REC-05-02',
        label: 'Revenus exceptionnels',
        detail: 'Recettes imprévues de l’exercice',
        suggested: true,
      },
      {
        value: 'rec-financiers-03',
        code: 'REC-05-03',
        label: 'Remboursements et remises obtenues',
        detail: 'Sommes récupérées ou remises accordées',
        suggested: true,
      },
    ],
  },

  /* ------------------------------------------------------------- DÉPENSES */
  {
    value: 'dep-personnel',
    code: 'DEP-01',
    section: 'depenses',
    label: 'Charges du personnel',
    detail: 'Rémunérations et charges sociales',
    keywords: 'pasteur ouvrier salaire indemnite cnss prime',
    subCategories: [
      {
        value: 'dep-personnel-01',
        code: 'DEP-01-01',
        label: 'Charges de personnel (pasteur et un ouvrier)',
        detail: 'Salaire du pasteur et d’un ouvrier',
      },
      {
        value: 'dep-personnel-02',
        code: 'DEP-01-02',
        label: 'Indemnités des diacres et des ouvriers',
        detail: 'Indemnités de service des diacres',
        suggested: true,
      },
      {
        value: 'dep-personnel-03',
        code: 'DEP-01-03',
        label: 'Cotisations sociales (CNSS) et assurances du personnel',
        detail: 'Déclarations sociales et couverture',
        suggested: true,
      },
      {
        value: 'dep-personnel-04',
        code: 'DEP-01-04',
        label: 'Prime de fin d’année',
        detail: 'Prime versée en fin d’exercice',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-externes',
    code: 'DEP-02',
    section: 'depenses',
    label: 'Charges administratives — autres charges externes',
    detail: 'Section, banque, comptabilité, assurances',
    keywords: 'section quote-part banque comptable audit assurance abonnement',
    subCategories: [
      {
        value: 'dep-externes-01',
        code: 'DEP-02-01',
        label: 'Quote-part versée à la section',
        detail: 'Quote-part statutaire reversée',
      },
      {
        value: 'dep-externes-02',
        code: 'DEP-02-02',
        label: 'Frais bancaires et commissions',
        detail: 'Tenue de compte et commissions',
        suggested: true,
      },
      {
        value: 'dep-externes-03',
        code: 'DEP-02-03',
        label: 'Honoraires du comptable et audit',
        detail: 'Comptabilité et révision des comptes',
        suggested: true,
      },
      {
        value: 'dep-externes-04',
        code: 'DEP-02-04',
        label: 'Primes d’assurance (multirisque)',
        detail: 'Assurance des bâtiments et du matériel',
        suggested: true,
      },
      {
        value: 'dep-externes-05',
        code: 'DEP-02-05',
        label: 'Abonnements (internet, presse, logiciels)',
        detail: 'Abonnements utiles au fonctionnement',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-fonctionnement',
    code: 'DEP-03',
    section: 'depenses',
    label: 'Charges des administrateurs — fonctionnement',
    detail: 'Frais courants des bâtiments et du bureau',
    keywords: 'eau electricite communication carburant vehicule accueil',
    subCategories: [
      {
        value: 'dep-fonctionnement-01',
        code: 'DEP-03-01',
        label: 'Eau, électricité et communication',
        detail: 'Factures d’eau, d’électricité et de communication',
      },
      {
        value: 'dep-fonctionnement-02',
        code: 'DEP-03-02',
        label: 'Carburant et entretien du véhicule',
        detail: 'Carburant et entretien courant du véhicule',
        suggested: true,
      },
      {
        value: 'dep-fonctionnement-03',
        code: 'DEP-03-03',
        label: 'Réception et hospitalité (accueil des invités)',
        detail: 'Accueil des invités et missionnaires',
        suggested: true,
      },
      {
        value: 'dep-fonctionnement-04',
        code: 'DEP-03-04',
        label: 'Produits d’entretien et d’hygiène',
        detail: 'Produits d’entretien des locaux',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-entretien',
    code: 'DEP-04',
    section: 'depenses',
    label: 'Charges administratives — entretiens et réparations',
    detail: 'Maintenance des bâtiments et équipements',
    keywords: 'entretien reparation residence salle culte sanitaire groupe electrogene',
    subCategories: [
      {
        value: 'dep-entretien-01',
        code: 'DEP-04-01',
        label: 'Frais d’entretien des concessions (résidence)',
        detail: 'Entretien du logement pastoral',
      },
      {
        value: 'dep-entretien-02',
        code: 'DEP-04-02',
        label: 'Entretien de la salle de culte',
        detail: 'Petits travaux dans la salle de culte',
        suggested: true,
      },
      {
        value: 'dep-entretien-03',
        code: 'DEP-04-03',
        label: 'Réparation du groupe électrogène',
        detail: 'Entretien du groupe électrogène',
        suggested: true,
      },
      {
        value: 'dep-entretien-04',
        code: 'DEP-04-04',
        label: 'Entretien des sanitaires et de la cour',
        detail: 'Sanitaires, cour et espaces extérieurs',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-evangelisation',
    code: 'DEP-05',
    section: 'depenses',
    label: 'Évangélisation et mission',
    detail: 'Campagnes et soutien aux missionnaires',
    keywords: 'evangelisation mission campagne missionnaire tract bible',
    subCategories: [
      {
        value: 'dep-evangelisation-01',
        code: 'DEP-05-01',
        label: 'Évangélisation et missions',
        detail: 'Actions d’évangélisation et sorties de mission',
      },
      {
        value: 'dep-evangelisation-02',
        code: 'DEP-05-02',
        label: 'Campagnes d’évangélisation',
        detail: 'Organisation des campagnes locales',
        suggested: true,
      },
      {
        value: 'dep-evangelisation-03',
        code: 'DEP-05-03',
        label: 'Soutien aux missionnaires',
        detail: 'Appui aux missionnaires soutenus',
        suggested: true,
      },
      {
        value: 'dep-evangelisation-04',
        code: 'DEP-05-04',
        label: 'Impression de tracts et achat de bibles',
        detail: 'Supports d’évangélisation et bibles',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-formation',
    code: 'DEP-06',
    section: 'depenses',
    label: 'Formation',
    detail: 'Formation des serviteurs et moniteurs',
    keywords: 'formation seminaire pasteur diacre moniteur ecole du dimanche',
    subCategories: [
      {
        value: 'dep-formation-01',
        code: 'DEP-06-01',
        label: 'Formation des pasteurs et diacres',
        detail: 'Sessions de formation des serviteurs',
      },
      {
        value: 'dep-formation-02',
        code: 'DEP-06-02',
        label: 'Séminaires des responsables et moniteurs',
        detail: 'Séminaires des responsables et moniteurs',
        suggested: true,
      },
      {
        value: 'dep-formation-03',
        code: 'DEP-06-03',
        label: 'Supports pédagogiques (école du dimanche)',
        detail: 'Manuels de l’école du dimanche',
        suggested: true,
      },
      {
        value: 'dep-formation-04',
        code: 'DEP-06-04',
        label: 'Participation aux conventions (déplacements)',
        detail: 'Frais de participation aux conventions',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-social',
    code: 'DEP-07',
    section: 'depenses',
    label: 'Dons, subventions et assistances sociales',
    detail: 'Entraide, diaconie et assistances',
    keywords: 'social diaconie veuve orphelin malade solidarite',
    subCategories: [
      {
        value: 'dep-social-01',
        code: 'DEP-07-01',
        label: 'Œuvres sociales et diaconie',
        detail: 'Aide aux personnes en difficulté',
      },
      {
        value: 'dep-social-02',
        code: 'DEP-07-02',
        label: 'Assistance aux veuves et aux orphelins',
        detail: 'Soutien aux veuves et aux orphelins',
        suggested: true,
      },
      {
        value: 'dep-social-03',
        code: 'DEP-07-03',
        label: 'Visites et soins des malades',
        detail: 'Visites et soutien des malades',
        suggested: true,
      },
      {
        value: 'dep-social-04',
        code: 'DEP-07-04',
        label: 'Fonds de solidarité',
        detail: 'Réserve pour les cas d’urgence',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-consommables',
    code: 'DEP-08',
    section: 'depenses',
    label: 'Charges administratives — achat de consommables et autres',
    detail: 'Fournitures et petit matériel',
    keywords: 'fourniture bureau consommable sainte cene secretariat',
    subCategories: [
      {
        value: 'dep-consommables-01',
        code: 'DEP-08-01',
        label: 'Fournitures de bureau',
        detail: 'Papeterie et fournitures du bureau',
      },
      {
        value: 'dep-consommables-02',
        code: 'DEP-08-02',
        label: 'Consommables pour la Sainte Cène',
        detail: 'Pain, coupe et linge de la Sainte Cène',
        suggested: true,
      },
      {
        value: 'dep-consommables-03',
        code: 'DEP-08-03',
        label: 'Petit matériel (ampoules, câbles, quincaillerie)',
        detail: 'Petit matériel et dépannages divers',
        suggested: true,
      },
      {
        value: 'dep-consommables-04',
        code: 'DEP-08-04',
        label: 'Fournitures du secrétariat (registres, carnets)',
        detail: 'Registres, carnets et archives',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-transport',
    code: 'DEP-09',
    section: 'depenses',
    label: 'Charges de transport et déplacement',
    detail: 'Déplacements du ministère et de la mission',
    keywords: 'transport deplacement mission village vehicule',
    subCategories: [
      {
        value: 'dep-transport-01',
        code: 'DEP-09-01',
        label: 'Transport et déplacement',
        detail: 'Frais de transport du ministère',
      },
      {
        value: 'dep-transport-02',
        code: 'DEP-09-02',
        label: 'Déplacements pastoraux',
        detail: 'Visites et déplacements du pasteur',
        suggested: true,
      },
      {
        value: 'dep-transport-03',
        code: 'DEP-09-03',
        label: 'Transport des invités et missionnaires',
        detail: 'Transport des invités et missionnaires',
        suggested: true,
      },
      {
        value: 'dep-transport-04',
        code: 'DEP-09-04',
        label: 'Missions dans les villages',
        detail: 'Frais de mission dans les villages',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-investissements',
    code: 'DEP-10',
    section: 'depenses',
    label: 'Investissements — immobilisations',
    detail: 'Acquisitions et travaux durables',
    keywords: 'investissement chaise sonorisation construction terrain solaire',
    subCategories: [
      {
        value: 'dep-investissements-01',
        code: 'DEP-10-01',
        label: 'Investissements (chaises, sonorisation)',
        detail: 'Chaises et matériel de sonorisation',
      },
      {
        value: 'dep-investissements-02',
        code: 'DEP-10-02',
        label: 'Construction et réhabilitation des bâtiments',
        detail: 'Travaux neufs et réhabilitation',
        suggested: true,
      },
      {
        value: 'dep-investissements-03',
        code: 'DEP-10-03',
        label: 'Acquisition de terrain',
        detail: 'Achat de terrain pour l’église',
        suggested: true,
      },
      {
        value: 'dep-investissements-04',
        code: 'DEP-10-04',
        label: 'Groupe électrogène et panneaux solaires',
        detail: 'Équipements d’alimentation en énergie',
        suggested: true,
      },
    ],
  },
  {
    value: 'dep-impots',
    code: 'DEP-11',
    section: 'depenses',
    label: 'Impôts et taxes',
    detail: 'Obligations fiscales et frais administratifs',
    keywords: 'impot taxe patente fonciere timbre',
    subCategories: [
      {
        value: 'dep-impots-01',
        code: 'DEP-11-01',
        label: 'Patente et impôts locaux',
        detail: 'Patente et impôts communaux',
        suggested: true,
      },
      {
        value: 'dep-impots-02',
        code: 'DEP-11-02',
        label: 'Taxes foncières',
        detail: 'Taxes sur les propriétés de l’église',
        suggested: true,
      },
      {
        value: 'dep-impots-03',
        code: 'DEP-11-03',
        label: 'Timbres et frais administratifs',
        detail: 'Timbres et frais de dossier',
        suggested: true,
      },
    ],
  },
]

/** Lignes budgétaires (sous-catégories) d'une catégorie. */
export function getSubCategories(categoryValue) {
  const category = CATEGORIES.find((item) => item.value === categoryValue)
  return category ? category.subCategories : []
}

/** Catégorie complète à partir de sa valeur. */
export function getCategory(categoryValue) {
  return CATEGORIES.find((item) => item.value === categoryValue) ?? null
}

/** Nombre de catégories et de lignes par section. */
export function sectionCounts() {
  const counts = {
    recettes: { categories: 0, lines: 0 },
    depenses: { categories: 0, lines: 0 },
  }
  for (const category of CATEGORIES) {
    counts[category.section].categories += 1
    counts[category.section].lines += category.subCategories.length
  }
  return counts
}
