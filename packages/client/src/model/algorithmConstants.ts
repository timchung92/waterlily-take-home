export const algorithmConstants = {
averageSlide7 : {
    confidence: 69,
    reason: createReason('0.3'),
},

careGapPct : {
    confidence: 67,
    reason: createReason('0.4')
},
childHelperPct : {
    confidence: 61,
    reason: createReason('0.3')
},
supportProffesionalHelp : {
    confidence: 74,
    reason: createReason('0.35')
},
ltcAge : {
    confidence: 73,
    reason: 'Confidence is based on a widely used statistical measure of the model\'s ability to accurately make predictions'
},
ltcSpan : {
    confidence: 76,
    reason: createReason('4 years')
},
ltcLikelyhood : {
    confidence: 71,
    reason: 'Confidence is based on the model\'s accuracy confidence'
},
medicalAndHelperAnnualCost : {
    confidence: 73,
    reason: createReason('$6,000')
},
ltcTotalCost : {
    confidence: 72,
    reason: 'Confidence is based on an accuracy confidence calculated with a plus minus margin of $10,000. This predicted cost assumes that family members do not step in, but all care is handled by professional care.'
},
monthlyHelpHours : {
    confidence: 72,
    reason: createReason('25 hours')
},
otherFamilyHelperPct : {
    confidence: 93,
    reason: createReason('0.3')
},
proffessionalHelperPct : {
    confidence: 77,
    reason: createReason('0.3')
},
spouseHelperPct : {
    confidence: 45,
    reason: createReason('0.3')
}
};

function createReason(confidenceMargin: string) {
  return `Confidence is based on an accuracy score calculated with a plus minus margin of ${ confidenceMargin }.`;
}
