[examma-ray](../README.md) / [Exports](../modules.md) / Exam

# Class: Exam

## Table of contents

### Constructors

- [constructor](Exam.md#constructor)

### Properties

- [enable_regrades](Exam.md#enable_regrades)
- [exam_id](Exam.md#exam_id)
- [html_announcements](Exam.md#html_announcements)
- [html_instructions](Exam.md#html_instructions)
- [mk_bottom_message](Exam.md#mk_bottom_message)
- [mk_download_message](Exam.md#mk_download_message)
- [mk_questions_message](Exam.md#mk_questions_message)
- [sections](Exam.md#sections)
- [title](Exam.md#title)

### Methods

- [addAnnouncement](Exam.md#addannouncement)
- [renderAnnouncements](Exam.md#renderannouncements)
- [renderHeader](Exam.md#renderheader)
- [renderInstructions](Exam.md#renderinstructions)

## Constructors

### constructor

• **new Exam**(`spec`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `spec` | [`ExamSpecification`](../modules.md#examspecification) |

#### Defined in

[exams.ts:672](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L672)

## Properties

### enable\_regrades

• `Readonly` **enable\_regrades**: `boolean`

#### Defined in

[exams.ts:670](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L670)

___

### exam\_id

• `Readonly` **exam\_id**: `string`

#### Defined in

[exams.ts:659](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L659)

___

### html\_announcements

• `Readonly` **html\_announcements**: readonly `string`[]

#### Defined in

[exams.ts:663](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L663)

___

### html\_instructions

• `Readonly` **html\_instructions**: `string`

#### Defined in

[exams.ts:662](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L662)

___

### mk\_bottom\_message

• `Readonly` **mk\_bottom\_message**: `string`

#### Defined in

[exams.ts:666](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L666)

___

### mk\_download\_message

• `Readonly` **mk\_download\_message**: `string`

#### Defined in

[exams.ts:665](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L665)

___

### mk\_questions\_message

• `Readonly` **mk\_questions\_message**: `string`

#### Defined in

[exams.ts:664](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L664)

___

### sections

• `Readonly` **sections**: readonly ([`Section`](Section.md) \| [`SectionSpecification`](../modules.md#sectionspecification) \| [`SectionChooser`](../modules.md#sectionchooser))[]

#### Defined in

[exams.ts:668](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L668)

___

### title

• `Readonly` **title**: `string`

#### Defined in

[exams.ts:660](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L660)

## Methods

### addAnnouncement

▸ **addAnnouncement**(`announcement_mk`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `announcement_mk` | `string` |

#### Returns

`void`

#### Defined in

[exams.ts:685](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L685)

___

### renderAnnouncements

▸ **renderAnnouncements**(): `string`

#### Returns

`string`

#### Defined in

[exams.ts:710](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L710)

___

### renderHeader

▸ **renderHeader**(`student`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `student` | [`StudentInfo`](../interfaces/StudentInfo.md) |

#### Returns

`string`

#### Defined in

[exams.ts:689](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L689)

___

### renderInstructions

▸ **renderInstructions**(): `string`

#### Returns

`string`

#### Defined in

[exams.ts:704](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L704)
