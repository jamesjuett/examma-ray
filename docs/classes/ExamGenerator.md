[examma-ray](../README.md) / [Exports](../modules.md) / ExamGenerator

# Class: ExamGenerator

## Table of contents

### Constructors

- [constructor](ExamGenerator.md#constructor)

### Properties

- [assignedExams](ExamGenerator.md#assignedexams)
- [assignedExamsByUniqname](ExamGenerator.md#assignedexamsbyuniqname)
- [exam](ExamGenerator.md#exam)
- [options](ExamGenerator.md#options)
- [questionStatsMap](ExamGenerator.md#questionstatsmap)
- [sectionStatsMap](ExamGenerator.md#sectionstatsmap)

### Methods

- [assignRandomizedExam](ExamGenerator.md#assignrandomizedexam)
- [assignRandomizedExams](ExamGenerator.md#assignrandomizedexams)
- [checkExam](ExamGenerator.md#checkexam)
- [createManifests](ExamGenerator.md#createmanifests)
- [createRandomizedExam](ExamGenerator.md#createrandomizedexam)
- [createRandomizedQuestion](ExamGenerator.md#createrandomizedquestion)
- [createRandomizedSection](ExamGenerator.md#createrandomizedsection)
- [makeSeed](ExamGenerator.md#makeseed)
- [renderExams](ExamGenerator.md#renderexams)
- [writeAll](ExamGenerator.md#writeall)
- [writeStats](ExamGenerator.md#writestats)

## Constructors

### constructor

• **new ExamGenerator**(`exam`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `exam` | [`Exam`](Exam.md) |
| `options` | `Partial`<[`ExamGeneratorOptions`](../modules.md#examgeneratoroptions)\> |

#### Defined in

[ExamGenerator.ts:58](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L58)

## Properties

### assignedExams

• `Readonly` **assignedExams**: [`AssignedExam`](AssignedExam.md)[] = `[]`

#### Defined in

[ExamGenerator.ts:50](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L50)

___

### assignedExamsByUniqname

• `Readonly` **assignedExamsByUniqname**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: [`AssignedExam`](AssignedExam.md) \| `undefined`

#### Defined in

[ExamGenerator.ts:51](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L51)

___

### exam

• `Readonly` **exam**: [`Exam`](Exam.md)

#### Defined in

[ExamGenerator.ts:49](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L49)

___

### options

• `Private` **options**: [`ExamGeneratorOptions`](../modules.md#examgeneratoroptions)

#### Defined in

[ExamGenerator.ts:56](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L56)

___

### questionStatsMap

• `Private` **questionStatsMap**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: `QuestionStats`

#### Defined in

[ExamGenerator.ts:54](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L54)

___

### sectionStatsMap

• `Private` **sectionStatsMap**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: `SectionStats`

#### Defined in

[ExamGenerator.ts:53](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L53)

## Methods

### assignRandomizedExam

▸ **assignRandomizedExam**(`student`): [`AssignedExam`](AssignedExam.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `student` | [`StudentInfo`](../interfaces/StudentInfo.md) |

#### Returns

[`AssignedExam`](AssignedExam.md)

#### Defined in

[ExamGenerator.ts:65](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L65)

___

### assignRandomizedExams

▸ **assignRandomizedExams**(`students`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `students` | readonly [`StudentInfo`](../interfaces/StudentInfo.md)[] |

#### Returns

`void`

#### Defined in

[ExamGenerator.ts:78](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L78)

___

### checkExam

▸ `Private` **checkExam**(`ae`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ae` | [`AssignedExam`](AssignedExam.md) |

#### Returns

`void`

#### Defined in

[ExamGenerator.ts:148](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L148)

___

### createManifests

▸ **createManifests**(): [`TrustedExamSubmission`](../modules.md#trustedexamsubmission)[]

#### Returns

[`TrustedExamSubmission`](../modules.md#trustedexamsubmission)[]

#### Defined in

[ExamGenerator.ts:190](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L190)

___

### createRandomizedExam

▸ `Private` **createRandomizedExam**(`student`, `rand?`): [`AssignedExam`](AssignedExam.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `student` | [`StudentInfo`](../interfaces/StudentInfo.md) |
| `rand` | `Randomizer` |

#### Returns

[`AssignedExam`](AssignedExam.md)

#### Defined in

[ExamGenerator.ts:82](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L82)

___

### createRandomizedQuestion

▸ `Private` **createRandomizedQuestion**(`question`, `student`, `sectionIndex`, `partIndex`, `sectionSkin`, `rand?`): [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `question` | [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\> |
| `student` | [`StudentInfo`](../interfaces/StudentInfo.md) |
| `sectionIndex` | `number` |
| `partIndex` | `number` |
| `sectionSkin` | [`QuestionSkin`](../modules.md#questionskin) |
| `rand` | `Randomizer` |

#### Returns

[`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[]

#### Defined in

[ExamGenerator.ts:127](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L127)

___

### createRandomizedSection

▸ `Private` **createRandomizedSection**(`section`, `student`, `sectionIndex`, `rand?`, `skinRand?`): [`AssignedSection`](AssignedSection.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `section` | [`Section`](Section.md) |
| `student` | [`StudentInfo`](../interfaces/StudentInfo.md) |
| `sectionIndex` | `number` |
| `rand` | `Randomizer` |
| `skinRand` | `Randomizer` |

#### Returns

[`AssignedSection`](AssignedSection.md)[]

#### Defined in

[ExamGenerator.ts:107](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L107)

___

### makeSeed

▸ `Private` **makeSeed**(`student`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `student` | [`StudentInfo`](../interfaces/StudentInfo.md) |

#### Returns

`string`

#### Defined in

[ExamGenerator.ts:101](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L101)

___

### renderExams

▸ **renderExams**(): `string`[]

#### Returns

`string`[]

#### Defined in

[ExamGenerator.ts:194](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L194)

___

### writeAll

▸ **writeAll**(`examDir?`, `manifestDir?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `examDir` | `string` | `"out"` |
| `manifestDir` | `string` | `"data"` |

#### Returns

`void`

#### Defined in

[ExamGenerator.ts:198](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L198)

___

### writeStats

▸ `Private` **writeStats**(): `void`

#### Returns

`void`

#### Defined in

[ExamGenerator.ts:178](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L178)
