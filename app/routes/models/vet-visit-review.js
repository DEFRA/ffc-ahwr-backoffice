const { formatedDateToUk, upperFirstLetter } = require('../../lib/display-helper')
const speciesNumbers = require('../../../app/constants/species-numbers')
const eligibleSpecies = require('../../../app/constants/eligible-species')

const getSheepDataRows = (data, formatedDate) => {
  const rows = []
  if (data.sheepWorms) rows.push([{ text: formatedDate }, { text: 'Worms in sheep?' }, { text: upperFirstLetter(data.sheepWorms) }])
  if (data.speciesTest) rows.push([{ text: formatedDate }, { text: 'Percentage reduction in EPG?' }, { text: data.speciesTest }])
  if (data.sheepWormTreatment) rows.push([{ text: formatedDate }, { text: 'Active chemical used in worming treatment' }, { text: upperFirstLetter(data.sheepWormTreatment) }])

  return rows
}

const getCattleDataRows = (data, formatedDate) => {
  const rows = []
  if (data.speciesVaccinated) rows.push([{ text: formatedDate }, { text: 'Species Vaccinated?' }, { text: upperFirstLetter(data.speciesVaccinated) }])
  if (data.speciesLastVaccinated) rows.push([{ text: formatedDate }, { text: 'Last Vaccinated?' }, { text: `${data.speciesLastVaccinated.month}-${data.speciesLastVaccinated.year}` }])
  if (data.speciesVaccinationUpToDate) rows.push([{ text: formatedDate }, { text: 'Vaccination up to date?' }, { text: upperFirstLetter(data.speciesVaccinationUpToDate) }])
  return rows
}

module.exports = (vetVisit, species) => {
  const { data, createdAt } = vetVisit
  const formatedDate = formatedDateToUk(createdAt)
  const rows = []
  rows.push(
    [{ text: formatedDate }, { text: 'Review date' }, { text: formatedDateToUk(data.visitDate) }],
    [{ text: formatedDate }, { text: eligibleSpecies[species] }, { text: upperFirstLetter(data.eligibleSpecies) }]
  )

  if (data.speciesBvdInHerd && (species === 'beef' || species === 'dairy')) {
    rows.push([{ text: formatedDate }, { text: 'BVD in herd?' }, { text: upperFirstLetter(data.speciesBvdInHerd) }])
  }

  if (data.speciesTest && species === 'pigs') {
    rows.push([{ text: formatedDate }, { text: 'PRRS in herd?' }, { text: upperFirstLetter(data.speciesTest) }])
  }

  if (data.speciesVaccinated && (species === 'beef' || species === 'dairy')) {
    rows.push(...getCattleDataRows(data, formatedDate))
  }

  if (data.sheepWorms && species === 'sheep') {
    rows.push(...getSheepDataRows(data, formatedDate))
  }

  rows.push([{ text: formatedDate }, { text: 'Report given?' }, { text: upperFirstLetter(data.reviewReport) }])

  return {
    head: [{ text: 'Date' }, { text: 'Data requested' }, { text: 'Data entered' }],
    rows
  }
}
