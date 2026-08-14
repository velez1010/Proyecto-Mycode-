export const CONFIG = Object.freeze({
  apiBase: '/api',
  defaultLanguage: 'es',
  storageKeys: Object.freeze({
    theme: 'mycode.theme.v4',
    language: 'mycode.language.v4'
  }),
  warningThresholds: Object.freeze({ low: 0.30, critical: 0.10 }),
  tokenCosts: Object.freeze({ basic: 1, advancedExplanation: 2, exercise: 3, complexAnalysis: 5, premium: 8 }),
  plans: Object.freeze({
    bronce: Object.freeze({ id: 'bronce', price: 22, tokens: 50, tone: 'bronze', badgeKey: null, benefitsKeys: ['plans.bronzeBenefit1','plans.bronzeBenefit2','plans.bronzeBenefit3'] }),
    plata: Object.freeze({ id: 'plata', price: 55, tokens: 120, tone: 'silver', badgeKey: 'plans.recommended', benefitsKeys: ['plans.silverBenefit1','plans.silverBenefit2','plans.silverBenefit3','plans.silverBenefit4'] }),
    oro: Object.freeze({ id: 'oro', price: 200, tokens: 350, tone: 'gold', badgeKey: 'plans.advanced', benefitsKeys: ['plans.goldBenefit1','plans.goldBenefit2','plans.goldBenefit3','plans.goldBenefit4','plans.goldBenefit5','plans.goldBenefit6','plans.goldBenefit7'] })
  }),
  planOrder: Object.freeze(['bronce','plata','oro']),
  courses: Object.freeze([
    Object.freeze({ id:'cpp', name:'C++', icon:'C++', titleKey:'courses.cppTitle', descriptionKey:'courses.cppDescription', keywords:['c++','cpp','variables','variables in programming','loops','bucles','pointers','punteros'] }),
    Object.freeze({ id:'java', name:'Java', icon:'☕', titleKey:'courses.javaTitle', descriptionKey:'courses.javaDescription', keywords:['java','classes','clases','objects','objetos','inheritance','herencia'] }),
    Object.freeze({ id:'python', name:'Python', icon:'Py', titleKey:'courses.pythonTitle', descriptionKey:'courses.pythonDescription', keywords:['python','variables','variables in programming','loops','bucles','functions','funciones'] }),
    Object.freeze({ id:'javascript', name:'JavaScript', icon:'JS', titleKey:'courses.javascriptTitle', descriptionKey:'courses.javascriptDescription', keywords:['javascript','js','web','dom','events','eventos','loops','bucles'] }),
    Object.freeze({ id:'csharp', name:'C#', icon:'C#', titleKey:'courses.csharpTitle', descriptionKey:'courses.csharpDescription', keywords:['c#','csharp','.net','dotnet','classes','clases','oop','poo'] })
  ]),
  content: Object.freeze([
    Object.freeze({ id:'variables', title:{es:'Variables',en:'Variables'}, description:{es:'Guarda datos y aprende cómo funcionan los tipos.',en:'Store data and learn how types work.'}, courseIds:['cpp','python','javascript'] }),
    Object.freeze({ id:'loops', title:{es:'Bucles',en:'Loops'}, description:{es:'Repite operaciones con for, while y estructuras relacionadas.',en:'Repeat operations with for, while and related structures.'}, courseIds:['cpp','python','javascript'] }),
    Object.freeze({ id:'classes', title:{es:'Clases y objetos',en:'Classes and Objects'}, description:{es:'Modela programas con programación orientada a objetos.',en:'Model programs with object-oriented programming.'}, courseIds:['java','csharp','cpp'] }),
    Object.freeze({ id:'functions', title:{es:'Funciones',en:'Functions'}, description:{es:'Divide la lógica y crea código reutilizable.',en:'Split logic and write reusable code.'}, courseIds:['python','javascript','cpp'] }),
    Object.freeze({ id:'inheritance', title:{es:'Herencia',en:'Inheritance'}, description:{es:'Aprende relaciones entre clases y reutilización de comportamiento.',en:'Learn class relationships and behavior reuse.'}, courseIds:['java','csharp'] })
  ])
});
