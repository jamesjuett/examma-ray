[examma-ray](../README.md) / [Exports](../modules.md) / ExamGrader

# Class: ExamGrader

## Table of contents

### Constructors

- [constructor](ExamGrader.md#constructor)

### Properties

- [allAssignedQuestions](ExamGrader.md#allassignedquestions)
- [allQuestions](ExamGrader.md#allquestions)
- [allSections](ExamGrader.md#allsections)
- [assignedQuestionsById](ExamGrader.md#assignedquestionsbyid)
- [curve](ExamGrader.md#curve)
- [exam](ExamGrader.md#exam)
- [exceptionMap](ExamGrader.md#exceptionmap)
- [graderMap](ExamGrader.md#gradermap)
- [options](ExamGrader.md#options)
- [questionsMap](ExamGrader.md#questionsmap)
- [sectionsMap](ExamGrader.md#sectionsmap)
- [stats](ExamGrader.md#stats)
- [submittedExams](ExamGrader.md#submittedexams)
- [submittedExamsByUniqname](ExamGrader.md#submittedexamsbyuniqname)

### Methods

- [addAppropriateExceptions](ExamGrader.md#addappropriateexceptions)
- [addSubmission](ExamGrader.md#addsubmission)
- [addSubmissions](ExamGrader.md#addsubmissions)
- [applyCurve](ExamGrader.md#applycurve)
- [createExamFromSubmission](ExamGrader.md#createexamfromsubmission)
- [createGradedFilenameBase](ExamGrader.md#creategradedfilenamebase)
- [getAllAssignedQuestionsById](ExamGrader.md#getallassignedquestionsbyid)
- [getGrader](ExamGrader.md#getgrader)
- [gradeAll](ExamGrader.md#gradeall)
- [loadAllSubmissions](ExamGrader.md#loadallsubmissions)
- [registerException](ExamGrader.md#registerexception)
- [registerExceptions](ExamGrader.md#registerexceptions)
- [registerGraders](ExamGrader.md#registergraders)
- [renderStatsToFile](ExamGrader.md#renderstatstofile)
- [writeAll](ExamGrader.md#writeall)
- [writeOverview](ExamGrader.md#writeoverview)
- [writeReports](ExamGrader.md#writereports)
- [writeScoresCsv](ExamGrader.md#writescorescsv)
- [writeStats](ExamGrader.md#writestats)
- [writeStatsFile](ExamGrader.md#writestatsfile)

## Constructors

### constructor

• **new ExamGrader**(`exam`, `options?`, `graders?`, `exceptions?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `exam` | [`Exam`](Exam.md) |
| `options` | `Partial`<`ExamGraderOptions`\> |
| `graders?` | [`GraderMap`](../modules.md#gradermap) \| readonly [`GraderMap`](../modules.md#gradermap)[] |
| `exceptions?` | [`ExceptionMap`](../modules.md#exceptionmap) \| readonly [`ExceptionMap`](../modules.md#exceptionmap)[] |

#### Defined in

[ExamGrader.ts:136](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L136)

## Properties

### allAssignedQuestions

• `Readonly` **allAssignedQuestions**: readonly [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[] = `[]`

#### Defined in

[ExamGrader.ts:122](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L122)

___

### allQuestions

• `Readonly` **allQuestions**: readonly [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\>[]

#### Defined in

[ExamGrader.ts:121](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L121)

___

### allSections

• `Readonly` **allSections**: readonly [`Section`](Section.md)[]

#### Defined in

[ExamGrader.ts:120](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L120)

___

### assignedQuestionsById

• `Private` `Readonly` **assignedQuestionsById**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: readonly [`AssignedQuestion`](AssignedQuestion.md)[] \| `undefined`

#### Defined in

[ExamGrader.ts:129](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L129)

___

### curve

• `Optional` `Readonly` **curve**: `ExamCurve`

#### Defined in

[ExamGrader.ts:125](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L125)

___

### exam

• `Readonly` **exam**: [`Exam`](Exam.md)

#### Defined in

[ExamGrader.ts:116](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L116)

___

### exceptionMap

• `Private` `Readonly` **exceptionMap**: [`ExceptionMap`](../modules.md#exceptionmap) = `{}`

#### Defined in

[ExamGrader.ts:132](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L132)

___

### graderMap

• `Private` `Readonly` **graderMap**: [`GraderMap`](../modules.md#gradermap) = `{}`

#### Defined in

[ExamGrader.ts:131](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L131)

___

### options

• `Private` **options**: `ExamGraderOptions`

#### Defined in

[ExamGrader.ts:134](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L134)

___

### questionsMap

• `Private` `Readonly` **questionsMap**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: [`Question`](Question.md) \| `undefined`

#### Defined in

[ExamGrader.ts:128](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L128)

___

### sectionsMap

• `Private` `Readonly` **sectionsMap**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: [`Section`](Section.md) \| `undefined`

#### Defined in

[ExamGrader.ts:127](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L127)

___

### stats

• `Readonly` **stats**: `GradedStats`

#### Defined in

[ExamGrader.ts:124](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L124)

___

### submittedExams

• `Readonly` **submittedExams**: [`AssignedExam`](AssignedExam.md)[] = `[]`

#### Defined in

[ExamGrader.ts:117](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L117)

___

### submittedExamsByUniqname

• `Readonly` **submittedExamsByUniqname**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: [`AssignedExam`](AssignedExam.md) \| `undefined`

#### Defined in

[ExamGrader.ts:118](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L118)

## Methods

### addAppropriateExceptions

▸ `Private` **addAppropriateExceptions**(`aq`, `student`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aq` | [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\> |
| `student` | [`StudentInfo`](../interfaces/StudentInfo.md) |

#### Returns

`void`

#### Defined in

[ExamGrader.ts:282](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L282)

___

### addSubmission

▸ **addSubmission**(`answers`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `answers` | [`TrustedExamSubmission`](../modules.md#trustedexamsubmission) |

#### Returns

`void`

#### Defined in

[ExamGrader.ts:164](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L164)

___

### addSubmissions

▸ **addSubmissions**(`answers`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `answers` | readonly [`TrustedExamSubmission`](../modules.md#trustedexamsubmission)[] |

#### Returns

`void`

#### Defined in

[ExamGrader.ts:178](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L178)

___

### applyCurve

▸ **applyCurve**(`curve`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `curve` | `ExamCurve` |

#### Returns

`void`

#### Defined in

[ExamGrader.ts:268](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L268)

___

### createExamFromSubmission

▸ `Private` **createExamFromSubmission**(`submission`): [`AssignedExam`](AssignedExam.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `submission` | [`TrustedExamSubmission`](../modules.md#trustedexamsubmission) |

#### Returns

[`AssignedExam`](AssignedExam.md)

#### Defined in

[ExamGrader.ts:189](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L189)

___

### createGradedFilenameBase

▸ `Private` **createGradedFilenameBase**(`ex`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ex` | [`AssignedExam`](AssignedExam.md) |

#### Returns

`string`

#### Defined in

[ExamGrader.ts:325](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L325)

___

### getAllAssignedQuestionsById

▸ **getAllAssignedQuestionsById**(`question_id`): readonly [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `question_id` | `string` |

#### Returns

readonly [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[]

#### Defined in

[ExamGrader.ts:352](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L352)

___

### getGrader

▸ **getGrader**(`question`): `undefined` \| [`QuestionGrader`](../interfaces/QuestionGrader.md)<`any`, `GradingResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `question` | [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\> |

#### Returns

`undefined` \| [`QuestionGrader`](../interfaces/QuestionGrader.md)<`any`, `GradingResult`\>

#### Defined in

[ExamGrader.ts:160](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L160)

___

### gradeAll

▸ **gradeAll**(): `void`

#### Returns

`void`

#### Defined in

[ExamGrader.ts:252](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L252)

___

### loadAllSubmissions

▸ **loadAllSubmissions**(): `void`

#### Returns

`void`

#### Defined in

[ExamGrader.ts:182](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L182)

___

### registerException

▸ **registerException**(`uniqname`, `question_id`, `exception`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `uniqname` | `string` |
| `question_id` | `string` |
| `exception` | [`Exception`](../modules.md#exception) |

#### Returns

`void`

#### Defined in

[ExamGrader.ts:245](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L245)

___

### registerExceptions

▸ **registerExceptions**(`exceptionMap`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `exceptionMap` | [`ExceptionMap`](../modules.md#exceptionmap) \| readonly [`ExceptionMap`](../modules.md#exceptionmap)[] |

#### Returns

`void`

#### Defined in

[ExamGrader.ts:236](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L236)

___

### registerGraders

▸ **registerGraders**(`graderMap`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `graderMap` | [`GraderMap`](../modules.md#gradermap) \| readonly [`GraderMap`](../modules.md#gradermap)[] |

#### Returns

`void`

#### Defined in

[ExamGrader.ts:224](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L224)

___

### renderStatsToFile

▸ `Private` **renderStatsToFile**(`question`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `question` | [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\> |

#### Returns

`void`

#### Defined in

[ExamGrader.ts:356](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L356)

___

### writeAll

▸ **writeAll**(): `void`

#### Returns

`void`

#### Defined in

[ExamGrader.ts:318](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L318)

___

### writeOverview

▸ **writeOverview**(): `void`

#### Returns

`void`

#### Defined in

[ExamGrader.ts:421](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L421)

___

### writeReports

▸ **writeReports**(): `void`

#### Returns

`void`

#### Defined in

[ExamGrader.ts:299](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L299)

___

### writeScoresCsv

▸ **writeScoresCsv**(): `void`

#### Returns

`void`

#### Defined in

[ExamGrader.ts:329](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L329)

___

### writeStats

▸ **writeStats**(): `void`

#### Returns

`void`

#### Defined in

[ExamGrader.ts:292](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L292)

___

### writeStatsFile

▸ `Private` **writeStatsFile**(`filename`, `body`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `filename` | `string` |
| `body` | `string` |

#### Returns

`void`

#### Defined in

[ExamGrader.ts:386](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L386)
