[examma-ray](../README.md) / [Exports](../modules.md) / AssignedSection

# Class: AssignedSection

## Table of contents

### Constructors

- [constructor](AssignedSection.md#constructor)

### Properties

- [_isFullyGraded](AssignedSection.md#_isfullygraded)
- [assignedQuestions](AssignedSection.md#assignedquestions)
- [displayIndex](AssignedSection.md#displayindex)
- [html_description](AssignedSection.md#html_description)
- [html_reference](AssignedSection.md#html_reference)
- [pointsEarned](AssignedSection.md#pointsearned)
- [pointsPossible](AssignedSection.md#pointspossible)
- [section](AssignedSection.md#section)
- [sectionIndex](AssignedSection.md#sectionindex)
- [skin](AssignedSection.md#skin)
- [uuid](AssignedSection.md#uuid)

### Methods

- [gradeAllQuestions](AssignedSection.md#gradeallquestions)
- [isGraded](AssignedSection.md#isgraded)
- [render](AssignedSection.md#render)
- [renderHeader](AssignedSection.md#renderheader)

## Constructors

### constructor

• **new AssignedSection**(`uuid`, `section`, `sectionIndex`, `skin`, `assignedQuestions`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `uuid` | `string` |
| `section` | [`Section`](Section.md) |
| `sectionIndex` | `number` |
| `skin` | [`QuestionSkin`](../modules.md#questionskin) |
| `assignedQuestions` | readonly [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[] |

#### Defined in

[exams.ts:323](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L323)

## Properties

### \_isFullyGraded

• `Private` **\_isFullyGraded**: `boolean` = `false`

#### Defined in

[exams.ts:318](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L318)

___

### assignedQuestions

• `Readonly` **assignedQuestions**: readonly [`AssignedQuestion`](AssignedQuestion.md)<[`ResponseKind`](../modules.md#responsekind)\>[]

___

### displayIndex

• `Readonly` **displayIndex**: `string`

#### Defined in

[exams.ts:313](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L313)

___

### html\_description

• `Private` `Readonly` **html\_description**: `string`

#### Defined in

[exams.ts:320](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L320)

___

### html\_reference

• `Private` `Optional` `Readonly` **html\_reference**: `string`

#### Defined in

[exams.ts:321](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L321)

___

### pointsEarned

• `Optional` `Readonly` **pointsEarned**: `number`

#### Defined in

[exams.ts:316](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L316)

___

### pointsPossible

• `Readonly` **pointsPossible**: `number`

#### Defined in

[exams.ts:315](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L315)

___

### section

• `Readonly` **section**: [`Section`](Section.md)

___

### sectionIndex

• `Readonly` **sectionIndex**: `number`

___

### skin

• `Readonly` **skin**: [`QuestionSkin`](../modules.md#questionskin)

___

### uuid

• `Readonly` **uuid**: `string`

## Methods

### gradeAllQuestions

▸ **gradeAllQuestions**(`ex`, `graders`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ex` | [`AssignedExam`](AssignedExam.md) |
| `graders` | [`GraderMap`](../modules.md#gradermap) |

#### Returns

`void`

#### Defined in

[exams.ts:337](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L337)

___

### isGraded

▸ **isGraded**(): this is GradedSection

#### Returns

this is GradedSection

#### Defined in

[exams.ts:403](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L403)

___

### render

▸ **render**(`mode`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode` | `RenderMode` |

#### Returns

`string`

#### Defined in

[exams.ts:374](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L374)

___

### renderHeader

▸ `Private` **renderHeader**(`mode`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode` | `RenderMode` |

#### Returns

`string`

#### Defined in

[exams.ts:358](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L358)
