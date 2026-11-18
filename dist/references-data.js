/* Public Air Force e-Publishing starting points. 2026-11-18 catalog discovery.
   These are indexed PDF examples, NOT assertions that a PDF is currently controlling.
   Every reference requires an e-Publishing currency/applicability check. */
window.FMReferenceData = {
  catalog: 'https://www.e-publishing.af.mil/Product-Index/',
  checked: '2026-11-18',
  commands: [
    {id:'ACC',name:'Air Combat Command'},
    {id:'AETC',name:'Air Education and Training Command'},
    {id:'AFGSC',name:'Air Force Global Strike Command'},
    {id:'AFMC',name:'Air Force Materiel Command'},
    {id:'AFRC',name:'Air Force Reserve Command'},
    {id:'AFSOC',name:'Air Force Special Operations Command'},
    {id:'AMC',name:'Air Mobility Command'},
    {id:'PACAF',name:'Pacific Air Forces'},
    {id:'USAFE-AFAFRICA',name:'US Air Forces in Europe–Air Forces Africa'},
    {id:'ANG',name:'Air National Guard (separate from MAJCOMs)'},
    {id:'DAF',name:'Department of the Air Force (parent publication)'}
  ],
  references: [
    {id:'daf21',command:'DAF',number:'DAFI21-101',title:'Aircraft and Equipment Maintenance Management',level:'Parent DAF publication',date:'2020-01-16',url:'https://static.e-publishing.af.mil/production/1/af_a4/publication/dafi21-101/dafi21-101.pdf',note:'Check current change notices and guidance memoranda, especially Chapters 5 and 14.'},
    {id:'acc21',command:'ACC',number:'AFI21-101_ACCSUP (2025 GM)',title:'ACC maintenance management supplement and guidance memorandum',level:'MAJCOM supplement / GM',date:'2025-09-04',url:'https://static.e-publishing.af.mil/production/1/acc/publication/afi21-101_accsup/afi21-101_accsup.pdf',note:'CAUTION: The 2025 guidance memorandum states a one-year expiration or supersession. Verify the applicable ACC publication in the official catalog before relying on this copy.'},
    {id:'accRPA',command:'ACC',number:'DAFI21-101_ACCSUP_ADD_C',title:'ACC Remotely Piloted Aircraft addendum C',level:'MAJCOM addendum',date:'2023-12-12',url:'https://static.e-publishing.af.mil/production/1/acc/publication/dafi21-101_accsup_add_c/afi21-101_accsup_add_c.pdf',note:'Applies to specified RPA/GCS operations, not all ACC aircraft; verify applicability.'},
    {id:'aetc12',command:'AETC',number:'AFI21-101_AETCSUP_12FTWSUP',title:'12th Flying Training Wing maintenance supplement',level:'Wing/local supplement',date:'2025-07-01',url:'https://static.e-publishing.af.mil/production/1/12ftw/publication/afi21-101_aetcsup_12ftwsup/afi21-101_aetcsup_12ftwsup.pdf',note:'This is a local 12 FTW supplement, NOT a substitute for locating the current AETC MAJCOM supplement.'},
    {id:'afgsc21',command:'AFGSC',number:'DAFI21-101_AFGSCSUP',title:'AFGSC aircraft and equipment maintenance management',level:'MAJCOM supplement',date:'2026-02-18',url:'https://static.e-publishing.af.mil/production/1/afgsc/publication/dafi21-101_afgscsup/dafi21-101_afgscsup.pdf',note:'February 2026 published supplement; verify the latest corrections and status before use.'},
    {id:'afmcC',command:'AFMC',number:'DAFI21-101_AFMCSUP_ADD_C',title:'AFMC addendum C (specialized operations)',level:'MAJCOM addendum',date:'2024-03-18',url:'https://static.e-publishing.af.mil/production/1/afmc/publication/dafi21-101_afmcsup_add_c/dafi21-101_afmcsup_add_c.pdf',note:'AFMC addendum with scoped applicability; obtain the parent AFMC supplement in the official catalog.'},
    {id:'afmcD',command:'AFMC',number:'DAFI21-101_AFMCSUP_ADD_D',title:'AFMC addendum D (USSF nonstandard organizations)',level:'MAJCOM addendum',date:'2022-11-08',url:'https://static.e-publishing.af.mil/production/1/afmc/publication/dafi21-101_afmcsup_add_d/dafi21-101_afmcsup_add_d.pdf',note:'Certified current July 2024 in the indexed copy. Restricted to described organizations; do not apply fleetwide.'},
    {id:'afrc442',command:'AFRC',number:'DAFI21-101_AFRCSUP_442FWSUP',title:'442nd Fighter Wing local maintenance supplement',level:'Wing/local supplement',date:'2024-06-10',url:'https://static.e-publishing.af.mil/production/1/442fw/publication/dafi21-101_afrcsup_442fwsup/dafi21-101_afrcsup_442fwsup.pdf',note:'Local supplement. The parent AFRC 21-101 supplement may have been revised; check the official catalog.'},
    {id:'afsocCannon',command:'AFSOC',number:'AFI21-101_AFSOCSUP_CANNONAFBSUP',title:'Cannon AFB maintenance supplement',level:'Wing/local supplement',date:'2023-03-21',url:'https://static.e-publishing.af.mil/production/1/cannonafb/publication/afi21-101_afsocsup_cannonafbsup/afi21-101_afsocsup_cannonafbsup.pdf',note:'Local AFSOC-unit supplement, not necessarily current AFSOC command-wide guidance.'},
    {id:'amcDover',command:'AMC',number:'DAFI21-101_AMCSUP_DOVERAFBSUP',title:'Dover AFB maintenance supplement',level:'Wing/local supplement',date:'2026-02-06',url:'https://static.e-publishing.af.mil/production/1/doverafb/publication/dafi21-101_amcsup_doverafbsup/dafi21-101_amcsup_doverafbsup.pdf',note:'Local supplement; check the parent AMC supplement and current effective changes.'},
    {id:'amc437',command:'AMC',number:'DAFI21-101_AMCSUP_437AWSUP',title:'437th Airlift Wing maintenance supplement',level:'Wing/local supplement',date:'2025-09-03',url:'https://static.e-publishing.af.mil/production/1/437aw/publication/dafi21-101_amcsup_437awsup/dafi21-101_amcsup_437awsup.pdf',note:'437 AW-specific procedures, not a command-wide reference.'},
    {id:'pacafKadena',command:'PACAF',number:'DAFI21-101_PACAFSUP_KADENAABSUP',title:'Kadena AB maintenance supplement',level:'Wing/local supplement',date:'2026-03-03',url:'https://static.e-publishing.af.mil/production/1/kadenaab/publication/dafi21-101_pacafsup_kadenaabsup/dafi21-101_pacafsup_kadenaabsup.pdf',note:'Local PACAF base supplement; verify the PACAF parent supplement separately.'},
    {id:'usafeLakenheath',command:'USAFE-AFAFRICA',number:'DAFI21-101_USAFE-AFAFRICASUP_LAKENHEATHSUP',title:'RAF Lakenheath maintenance supplement',level:'Wing/local supplement',date:'2021-11-05',url:'https://static.e-publishing.af.mil/production/1/lakenheath/publication/dafi21-101_usafe-afafricasup_lakenheathsup/dafi21-101_usafe-afafricasup_lakenheathsup.pdf',note:'Historical Lakenheath-specific copy. Verify latest USAFE-AFAFRICA and installation guidance (including Aviano) in the catalog.'},
    {id:'angF35',command:'ANG',number:'AFI21-101_ANGSUP_ADD_B',title:'ANG F-35 maintenance addendum B',level:'ANG addendum',date:'2021-07-16',url:'https://static.e-publishing.af.mil/production/1/ang/publication/afi21-101_angsup_add_b/afi21-101_angsup_add-b.pdf',note:'F-35-specific; indexed copy certified current March 2025. ANG is listed separately from MAJCOMs.'}
  ]
};
