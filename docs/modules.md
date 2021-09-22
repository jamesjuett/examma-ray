[examma-ray](README.md) / Exports

# examma-ray

## Table of contents

### Namespaces

- [ExamUtils](modules/ExamUtils.md)

### Classes

- [AssignedExam](classes/AssignedExam.md)
- [AssignedQuestion](classes/AssignedQuestion.md)
- [AssignedSection](classes/AssignedSection.md)
- [CodeWritingGrader](classes/CodeWritingGrader.md)
- [Exam](classes/Exam.md)
- [ExamGenerator](classes/ExamGenerator.md)
- [ExamGrader](classes/ExamGrader.md)
- [FITBRegexGrader](classes/FITBRegexGrader.md)
- [FreebieGrader](classes/FreebieGrader.md)
- [Question](classes/Question.md)
- [QuestionBank](classes/QuestionBank.md)
- [Section](classes/Section.md)
- [SimpleMCGrader](classes/SimpleMCGrader.md)
- [StandardSASGrader](classes/StandardSASGrader.md)
- [SummationMCGrader](classes/SummationMCGrader.md)

### Interfaces

- [QuestionGrader](interfaces/QuestionGrader.md)
- [QuestionGradingRecords](interfaces/QuestionGradingRecords.md)
- [StudentInfo](interfaces/StudentInfo.md)

### Type aliases

- [CodeEditorSpecification](modules.md#codeeditorspecification)
- [CodeEditorSubmission](modules.md#codeeditorsubmission)
- [CodeWritingGradingResult](modules.md#codewritinggradingresult)
- [CodeWritingRubricItem](modules.md#codewritingrubricitem)
- [ExamGeneratorOptions](modules.md#examgeneratoroptions)
- [ExamSpecification](modules.md#examspecification)
- [ExamSubmission](modules.md#examsubmission)
- [Exception](modules.md#exception)
- [ExceptionMap](modules.md#exceptionmap)
- [FITBRegexGradingResult](modules.md#fitbregexgradingresult)
- [FITBRegexMatcher](modules.md#fitbregexmatcher)
- [FITBRegexRubricItem](modules.md#fitbregexrubricitem)
- [FITBSpecification](modules.md#fitbspecification)
- [FITBSubmission](modules.md#fitbsubmission)
- [FreebieGradingResult](modules.md#freebiegradingresult)
- [GraderMap](modules.md#gradermap)
- [GradingAssignmentSpecification](modules.md#gradingassignmentspecification)
- [MCSpecification](modules.md#mcspecification)
- [MCSubmission](modules.md#mcsubmission)
- [QuestionAnswer](modules.md#questionanswer)
- [QuestionChooser](modules.md#questionchooser)
- [QuestionGradingRecord](modules.md#questiongradingrecord)
- [QuestionSkin](modules.md#questionskin)
- [QuestionSpecification](modules.md#questionspecification)
- [ResponseHandler](modules.md#responsehandler)
- [ResponseKind](modules.md#responsekind)
- [ResponseSpecification](modules.md#responsespecification)
- [SASGroup](modules.md#sasgroup)
- [SASItem](modules.md#sasitem)
- [SASSpecification](modules.md#sasspecification)
- [SASSubmission](modules.md#sassubmission)
- [SectionAnswers](modules.md#sectionanswers)
- [SectionChooser](modules.md#sectionchooser)
- [SectionSpecification](modules.md#sectionspecification)
- [SimpleMCGradingResult](modules.md#simplemcgradingresult)
- [SkinGenerator](modules.md#skingenerator)
- [SubmissionType](modules.md#submissiontype)
- [SummationMCGradingResult](modules.md#summationmcgradingresult)
- [TrustedExamSubmission](modules.md#trustedexamsubmission)

### Variables

- [CHOOSE_ALL](modules.md#choose_all)
- [DEFAULT_SAVER_MESSAGE_CANVAS](modules.md#default_saver_message_canvas)
- [DEFAULT_SKIN_GENERATOR](modules.md#default_skin_generator)
- [RESPONSE_HANDLERS](modules.md#response_handlers)

### Functions

- [BY_ID](modules.md#by_id)
- [CUSTOMIZE](modules.md#customize)
- [RANDOM_ANY](modules.md#random_any)
- [RANDOM_BY_TAG](modules.md#random_by_tag)
- [RANDOM_SECTION](modules.md#random_section)
- [RANDOM_SKIN](modules.md#random_skin)
- [SINGLE_REPLACEMENT_SKINS](modules.md#single_replacement_skins)
- [chooseQuestions](modules.md#choosequestions)
- [chooseSections](modules.md#choosesections)
- [fillManifest](modules.md#fillmanifest)
- [isValidID](modules.md#isvalidid)

## Type aliases

### CodeEditorSpecification

Ƭ **CodeEditorSpecification**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `code_language` | `string` |
| `codemirror_mime_type` | `string` |
| `default_grader?` | [`QuestionGrader`](interfaces/QuestionGrader.md)<``"code_editor"``, `any`\> |
| `footer?` | `string` |
| `header?` | `string` |
| `kind` | ``"code_editor"`` |
| `sample_solution?` | `Exclude`<[`CodeEditorSubmission`](modules.md#codeeditorsubmission), typeof `BLANK_SUBMISSION`\> |
| `starter` | `string` |

#### Defined in

[response/code_editor.ts:7](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/code_editor.ts#L7)

___

### CodeEditorSubmission

Ƭ **CodeEditorSubmission**: `string` \| typeof `BLANK_SUBMISSION`

#### Defined in

[response/code_editor.ts:18](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/code_editor.ts#L18)

___

### CodeWritingGradingResult

Ƭ **CodeWritingGradingResult**: `GradingResult` & { `itemResults`: { [index: string]: `CodeWritingRubricItemGradingResult` \| `undefined`;  } ; `verified`: `boolean`  }

#### Defined in

[graders/CodeWritingGrader.ts:28](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L28)

___

### CodeWritingRubricItem

Ƭ **CodeWritingRubricItem**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `description` | `string` |
| `id` | `string` |
| `points` | `number` |
| `title` | `string` |

#### Defined in

[graders/CodeWritingGrader.ts:15](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/CodeWritingGrader.ts#L15)

___

### ExamGeneratorOptions

Ƭ **ExamGeneratorOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `allow_duplicates` | `boolean` |
| `choose_all?` | `boolean` |
| `consistent_randomization?` | `boolean` |
| `frontend_js_path` | `string` |
| `student_ids` | ``"uniqname"`` \| ``"uuidv4"`` \| ``"uuidv5"`` |
| `students` | readonly [`StudentInfo`](interfaces/StudentInfo.md)[] |
| `uuidv5_namespace?` | `string` |

#### Defined in

[ExamGenerator.ts:25](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGenerator.ts#L25)

___

### ExamSpecification

Ƭ **ExamSpecification**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `enable_regrades?` | `boolean` |
| `id` | `string` |
| `mk_announcements?` | `string`[] |
| `mk_bottom_message?` | `string` |
| `mk_download_message?` | `string` |
| `mk_intructions` | `string` |
| `mk_questions_message?` | `string` |
| `sections` | readonly ([`SectionSpecification`](modules.md#sectionspecification) \| [`Section`](classes/Section.md) \| [`SectionChooser`](modules.md#sectionchooser))[] |
| `title` | `string` |

#### Defined in

[specification.ts:15](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L15)

___

### ExamSubmission

Ƭ **ExamSubmission**<`V`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `V` | extends `boolean``boolean` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `exam_id` | `string` |
| `saverId` | `number` |
| `sections` | [`SectionAnswers`](modules.md#sectionanswers)[] |
| `student` | `Object` |
| `student.name` | `string` |
| `student.uniqname` | `string` |
| `time_started?` | `number` |
| `timestamp` | `number` |
| `trusted` | `V` |
| `uuid` | `string` |

#### Defined in

[submissions.ts:23](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/submissions.ts#L23)

___

### Exception

Ƭ **Exception**: `Object`

An exception including an adjusted score and an explanation
of why the exception was applied.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `adjustedScore` | `number` |
| `explanation` | `string` |

#### Defined in

[ExamGrader.ts:535](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L535)

___

### ExceptionMap

Ƭ **ExceptionMap**: `Object`

A mapping from (uniqname, question id) to any exceptions applied
for that student for that question. Only one exception may be
specified per student/question pair.

#### Index signature

▪ [index: `string`]: { [index: string]: [`Exception`](modules.md#exception) \| `undefined`;  }

#### Defined in

[ExamGrader.ts:545](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L545)

___

### FITBRegexGradingResult

Ƭ **FITBRegexGradingResult**: `ImmutableGradingResult` & { `itemResults`: readonly { `explanation?`: `string` ; `matched`: `boolean` ; `pointsEarned`: `number`  }[]  }

#### Defined in

[graders/FITBRegexGrader.ts:13](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L13)

___

### FITBRegexMatcher

Ƭ **FITBRegexMatcher**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `explanation` | `string` |
| `pattern` | `RegExp` \| readonly `string`[] \| (`s`: `string`) => `boolean` |
| `points` | `number` |

#### Defined in

[graders/FITBRegexGrader.ts:21](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L21)

___

### FITBRegexRubricItem

Ƭ **FITBRegexRubricItem**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `blankIndex` | `number` |
| `description` | `string` |
| `patterns` | [`FITBRegexMatcher`](modules.md#fitbregexmatcher)[] |
| `points` | `number` |
| `title` | `string` |

#### Defined in

[graders/FITBRegexGrader.ts:27](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FITBRegexGrader.ts#L27)

___

### FITBSpecification

Ƭ **FITBSpecification**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `content` | `string` |
| `default_grader?` | [`QuestionGrader`](interfaces/QuestionGrader.md)<``"fitb"``, `any`\> |
| `kind` | ``"fitb"`` |
| `sample_solution?` | `Exclude`<[`FITBSubmission`](modules.md#fitbsubmission), typeof `BLANK_SUBMISSION`\> |

#### Defined in

[response/fitb.ts:9](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/fitb.ts#L9)

___

### FITBSubmission

Ƭ **FITBSubmission**: readonly `string`[] \| typeof `BLANK_SUBMISSION`

#### Defined in

[response/fitb.ts:16](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/fitb.ts#L16)

___

### FreebieGradingResult

Ƭ **FreebieGradingResult**: `ImmutableGradingResult`

#### Defined in

[graders/FreebieGrader.ts:7](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/FreebieGrader.ts#L7)

___

### GraderMap

Ƭ **GraderMap**: `Object`

A mapping of question ID to grader.

#### Index signature

▪ [index: `string`]: [`QuestionGrader`](interfaces/QuestionGrader.md)<`any`\> \| `undefined`

#### Defined in

[ExamGrader.ts:527](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/ExamGrader.ts#L527)

___

### GradingAssignmentSpecification

Ƭ **GradingAssignmentSpecification**<`QT`, `GR`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `QT` | extends [`ResponseKind`](modules.md#responsekind)[`ResponseKind`](modules.md#responsekind) |
| `GR` | extends `GradingResult``GradingResult` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `exam_id` | `string` |
| `groups` | `GradingGroup`<`QT`, `GR`\>[] |
| `name?` | `string` |
| `question_id` | `string` |

#### Defined in

[grading/common.ts:22](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/grading/common.ts#L22)

___

### MCSpecification

Ƭ **MCSpecification**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `choices` | `string`[] |
| `default_grader?` | [`QuestionGrader`](interfaces/QuestionGrader.md)<``"multiple_choice"``, `any`\> |
| `kind` | ``"multiple_choice"`` |
| `multiple` | `boolean` |
| `sample_solution?` | `Exclude`<[`MCSubmission`](modules.md#mcsubmission), typeof `BLANK_SUBMISSION`\> |

#### Defined in

[response/multiple_choice.ts:9](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/multiple_choice.ts#L9)

___

### MCSubmission

Ƭ **MCSubmission**: readonly `number`[] \| typeof `BLANK_SUBMISSION`

#### Defined in

[response/multiple_choice.ts:17](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/multiple_choice.ts#L17)

___

### QuestionAnswer

Ƭ **QuestionAnswer**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `display_index` | `string` |
| `kind` | [`ResponseKind`](modules.md#responsekind) |
| `marked_for_regrade?` | `boolean` |
| `question_id` | `string` |
| `regrade_request?` | `string` |
| `response` | `string` |
| `skin_id` | `string` |
| `uuid` | `string` |

#### Defined in

[submissions.ts:4](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/submissions.ts#L4)

___

### QuestionChooser

Ƭ **QuestionChooser**: (`exam`: [`Exam`](classes/Exam.md), `student`: [`StudentInfo`](interfaces/StudentInfo.md), `rand`: `Randomizer`) => readonly [`Question`](classes/Question.md)[]

#### Type declaration

▸ (`exam`, `student`, `rand`): readonly [`Question`](classes/Question.md)[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `exam` | [`Exam`](classes/Exam.md) |
| `student` | [`StudentInfo`](interfaces/StudentInfo.md) |
| `rand` | `Randomizer` |

##### Returns

readonly [`Question`](classes/Question.md)[]

#### Defined in

[specification.ts:59](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L59)

___

### QuestionGradingRecord

Ƭ **QuestionGradingRecord**<`GR`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `GR` | extends `GradingResult` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `exam_uuid` | `string` |
| `grading_result` | `GR` |
| `question_uuid` | `string` |
| `staff_uniqname` | `string` |
| `student` | [`StudentInfo`](interfaces/StudentInfo.md) |

#### Defined in

[grading/common.ts:37](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/grading/common.ts#L37)

___

### QuestionSkin

Ƭ **QuestionSkin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `non_composite_id?` | `string` |
| `replacements` | `Object` |

#### Defined in

[skins.ts:5](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/skins.ts#L5)

___

### QuestionSpecification

Ƭ **QuestionSpecification**<`QT`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `QT` | extends [`ResponseKind`](modules.md#responsekind)[`ResponseKind`](modules.md#responsekind) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `mk_description` | `string` |
| `points` | `number` |
| `response` | [`ResponseSpecification`](modules.md#responsespecification)<`QT`\> |
| `skins?` | [`SkinGenerator`](modules.md#skingenerator) |
| `tags?` | readonly `string`[] |

#### Defined in

[specification.ts:102](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L102)

___

### ResponseHandler

Ƭ **ResponseHandler**<`QT`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `QT` | extends [`ResponseKind`](modules.md#responsekind) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `activate?` | (`responseElem`: `JQuery`<`HTMLElement`\>) => `void` |
| `extract` | (`responseElem`: `JQuery`<`HTMLElement`\>) => [`SubmissionType`](modules.md#submissiontype)<`QT`\> |
| `fill` | (`elem`: `JQuery`<`HTMLElement`\>, `submission`: [`SubmissionType`](modules.md#submissiontype)<`QT`\>) => `void` |
| `parse` | (`rawSubmission`: `undefined` \| ``null`` \| `string`) => [`SubmissionType`](modules.md#submissiontype)<`QT`\> \| typeof `MALFORMED_SUBMISSION` |
| `render` | (`response`: [`ResponseSpecification`](modules.md#responsespecification)<`QT`\>, `question_id`: `string`, `question_uuid`: `string`, `skin?`: [`QuestionSkin`](modules.md#questionskin)) => `string` |

#### Defined in

[response/responses.ts:27](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/responses.ts#L27)

___

### ResponseKind

Ƭ **ResponseKind**: ``"multiple_choice"`` \| ``"fitb"`` \| ``"select_a_statement"`` \| ``"code_editor"`` \| ``"fitb_drop"``

#### Defined in

[response/common.ts:1](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/common.ts#L1)

___

### ResponseSpecification

Ƭ **ResponseSpecification**<`QT`\>: `QT` extends ``"multiple_choice"`` ? [`MCSpecification`](modules.md#mcspecification) : `QT` extends ``"fitb"`` ? [`FITBSpecification`](modules.md#fitbspecification) : `QT` extends ``"select_a_statement"`` ? [`SASSpecification`](modules.md#sasspecification) : `QT` extends ``"code_editor"`` ? [`CodeEditorSpecification`](modules.md#codeeditorspecification) : `QT` extends ``"fitb_drop"`` ? `FITBDropSpecification` : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `QT` | extends [`ResponseKind`](modules.md#responsekind) |

#### Defined in

[response/responses.ts:10](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/responses.ts#L10)

___

### SASGroup

Ƭ **SASGroup**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `items` | [`SASItem`](modules.md#sasitem)[] |
| `kind` | ``"group"`` |
| `title?` | `string` |

#### Defined in

[response/select_a_statement.ts:15](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/select_a_statement.ts#L15)

___

### SASItem

Ƭ **SASItem**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `forced?` | `boolean` |
| `kind` | ``"item"`` |
| `text` | `string` |

#### Defined in

[response/select_a_statement.ts:9](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/select_a_statement.ts#L9)

___

### SASSpecification

Ƭ **SASSpecification**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `choices` | ([`SASGroup`](modules.md#sasgroup) \| [`SASItem`](modules.md#sasitem))[] |
| `code_language` | `string` |
| `default_grader?` | [`QuestionGrader`](interfaces/QuestionGrader.md)<``"select_a_statement"``, `any`\> |
| `footer?` | `string` |
| `header?` | `string` |
| `kind` | ``"select_a_statement"`` |
| `sample_solution?` | `Exclude`<[`SASSubmission`](modules.md#sassubmission), typeof `BLANK_SUBMISSION`\> |

#### Defined in

[response/select_a_statement.ts:21](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/select_a_statement.ts#L21)

___

### SASSubmission

Ƭ **SASSubmission**: readonly `number`[] \| typeof `BLANK_SUBMISSION`

#### Defined in

[response/select_a_statement.ts:31](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/select_a_statement.ts#L31)

___

### SectionAnswers

Ƭ **SectionAnswers**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `display_index` | `string` |
| `questions` | [`QuestionAnswer`](modules.md#questionanswer)[] |
| `section_id` | `string` |
| `skin_id` | `string` |
| `uuid` | `string` |

#### Defined in

[submissions.ts:15](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/submissions.ts#L15)

___

### SectionChooser

Ƭ **SectionChooser**: (`exam`: [`Exam`](classes/Exam.md), `student`: [`StudentInfo`](interfaces/StudentInfo.md), `rand`: `Randomizer`) => readonly [`Section`](classes/Section.md)[]

#### Type declaration

▸ (`exam`, `student`, `rand`): readonly [`Section`](classes/Section.md)[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `exam` | [`Exam`](classes/Exam.md) |
| `student` | [`StudentInfo`](interfaces/StudentInfo.md) |
| `rand` | `Randomizer` |

##### Returns

readonly [`Section`](classes/Section.md)[]

#### Defined in

[specification.ts:27](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L27)

___

### SectionSpecification

Ƭ **SectionSpecification**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `mk_description` | `string` |
| `mk_reference?` | `string` |
| `questions` | [`QuestionSpecification`](modules.md#questionspecification) \| [`Question`](classes/Question.md) \| [`QuestionChooser`](modules.md#questionchooser) \| readonly ([`QuestionSpecification`](modules.md#questionspecification) \| [`Question`](classes/Question.md) \| [`QuestionChooser`](modules.md#questionchooser))[] |
| `reference_width?` | `number` |
| `skins?` | [`SkinGenerator`](modules.md#skingenerator) |
| `title` | `string` |

#### Defined in

[specification.ts:49](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L49)

___

### SimpleMCGradingResult

Ƭ **SimpleMCGradingResult**: `ImmutableGradingResult` & { `indexChosen`: `number` ; `indexCorrect`: `number`  }

chosen is -1 if the submission was blank

#### Defined in

[graders/SimpleMCGrader.ts:15](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SimpleMCGrader.ts#L15)

___

### SkinGenerator

Ƭ **SkinGenerator**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `generate` | (`exam`: [`Exam`](classes/Exam.md), `student`: [`StudentInfo`](interfaces/StudentInfo.md), `rand`: `Randomizer`) => readonly [`QuestionSkin`](modules.md#questionskin)[] |
| `getById` | (`id`: `string`) => `undefined` \| [`QuestionSkin`](modules.md#questionskin) |

#### Defined in

[specification.ts:113](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L113)

___

### SubmissionType

Ƭ **SubmissionType**<`QT`\>: `QT` extends ``"multiple_choice"`` ? [`MCSubmission`](modules.md#mcsubmission) : `QT` extends ``"fitb"`` ? [`FITBSubmission`](modules.md#fitbsubmission) : `QT` extends ``"select_a_statement"`` ? [`SASSubmission`](modules.md#sassubmission) : `QT` extends ``"code_editor"`` ? [`CodeEditorSubmission`](modules.md#codeeditorsubmission) : `QT` extends ``"fitb_drop"`` ? `FITBDropSubmission` : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `QT` | extends [`ResponseKind`](modules.md#responsekind) |

#### Defined in

[response/responses.ts:18](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/responses.ts#L18)

___

### SummationMCGradingResult

Ƭ **SummationMCGradingResult**: `ImmutableGradingResult` & { `selections`: readonly { `pointsEarned`: `number` ; `selected`: `boolean`  }[]  }

#### Defined in

[graders/SummationMCGrader.ts:12](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/graders/SummationMCGrader.ts#L12)

___

### TrustedExamSubmission

Ƭ **TrustedExamSubmission**: [`ExamSubmission`](modules.md#examsubmission)<``true``\>

#### Defined in

[submissions.ts:37](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/submissions.ts#L37)

## Variables

### CHOOSE\_ALL

• **CHOOSE\_ALL**: typeof [`CHOOSE_ALL`](modules.md#choose_all)

#### Defined in

[specification.ts:13](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L13)

___

### DEFAULT\_SAVER\_MESSAGE\_CANVAS

• **DEFAULT\_SAVER\_MESSAGE\_CANVAS**: ``"Click the button below to save a copy of your answers as a `.json`\nfile. You may save as many times as you like. You can also restore answers\nfrom a previously saved file.\n\n**Important!** You MUST submit your `.json` answers file to **Canvas**\nBEFORE exam time is up. This webpage does not save your answers anywhere other than your local computer.\nIt is up to you to download your answer file and turn it in on **Canvas**.\n\n**Note:** If you download multiple times, make sure to submit the most recent one. (The name of the file you submit to Canvas does not matter.)"``

#### Defined in

[exams.ts:624](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L624)

___

### DEFAULT\_SKIN\_GENERATOR

• **DEFAULT\_SKIN\_GENERATOR**: [`SkinGenerator`](modules.md#skingenerator)

#### Defined in

[specification.ts:118](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L118)

___

### RESPONSE\_HANDLERS

• **RESPONSE\_HANDLERS**: { [QT in ResponseKind]: ResponseHandler<QT\> }

#### Defined in

[response/responses.ts:35](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/response/responses.ts#L35)

## Functions

### BY\_ID

▸ **BY_ID**(`id`, `questionBank`): (`exam`: [`Exam`](classes/Exam.md), `student`: [`StudentInfo`](interfaces/StudentInfo.md), `rand`: `Randomizer`) => [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `questionBank` | [`QuestionBank`](classes/QuestionBank.md) |

#### Returns

`fn`

▸ (`exam`, `student`, `rand`): [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `exam` | [`Exam`](classes/Exam.md) |
| `student` | [`StudentInfo`](interfaces/StudentInfo.md) |
| `rand` | `Randomizer` |

##### Returns

[`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

#### Defined in

[specification.ts:67](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L67)

___

### CUSTOMIZE

▸ **CUSTOMIZE**(`spec`, `customizations`): [`QuestionSpecification`](modules.md#questionspecification)

#### Parameters

| Name | Type |
| :------ | :------ |
| `spec` | [`QuestionSpecification`](modules.md#questionspecification)<[`ResponseKind`](modules.md#responsekind)\> |
| `customizations` | `Partial`<[`QuestionSpecification`](modules.md#questionspecification)<[`ResponseKind`](modules.md#responsekind)\>\> |

#### Returns

[`QuestionSpecification`](modules.md#questionspecification)

#### Defined in

[specification.ts:139](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L139)

▸ **CUSTOMIZE**(`spec`, `customizations`): [`SectionSpecification`](modules.md#sectionspecification)

#### Parameters

| Name | Type |
| :------ | :------ |
| `spec` | [`SectionSpecification`](modules.md#sectionspecification) |
| `customizations` | `Partial`<[`SectionSpecification`](modules.md#sectionspecification)\> |

#### Returns

[`SectionSpecification`](modules.md#sectionspecification)

#### Defined in

[specification.ts:140](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L140)

▸ **CUSTOMIZE**(`spec`, `customizations`): [`ExamSpecification`](modules.md#examspecification)

#### Parameters

| Name | Type |
| :------ | :------ |
| `spec` | [`ExamSpecification`](modules.md#examspecification) |
| `customizations` | `Partial`<[`ExamSpecification`](modules.md#examspecification)\> |

#### Returns

[`ExamSpecification`](modules.md#examspecification)

#### Defined in

[specification.ts:141](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L141)

___

### RANDOM\_ANY

▸ **RANDOM_ANY**(`n`, `questionBank`): (`exam`: [`Exam`](classes/Exam.md), `student`: [`StudentInfo`](interfaces/StudentInfo.md), `rand`: `Randomizer`) => readonly [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `n` | `number` |
| `questionBank` | [`QuestionBank`](classes/QuestionBank.md) \| readonly ([`QuestionSpecification`](modules.md#questionspecification)<[`ResponseKind`](modules.md#responsekind)\> \| [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>)[] |

#### Returns

`fn`

▸ (`exam`, `student`, `rand`): readonly [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `exam` | [`Exam`](classes/Exam.md) |
| `student` | [`StudentInfo`](interfaces/StudentInfo.md) |
| `rand` | `Randomizer` |

##### Returns

readonly [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

#### Defined in

[specification.ts:86](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L86)

___

### RANDOM\_BY\_TAG

▸ **RANDOM_BY_TAG**(`tag`, `n`, `questionBank`): (`exam`: [`Exam`](classes/Exam.md), `student`: [`StudentInfo`](interfaces/StudentInfo.md), `rand`: `Randomizer`) => [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `tag` | `string` |
| `n` | `number` |
| `questionBank` | [`QuestionBank`](classes/QuestionBank.md) |

#### Returns

`fn`

▸ (`exam`, `student`, `rand`): [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `exam` | [`Exam`](classes/Exam.md) |
| `student` | [`StudentInfo`](interfaces/StudentInfo.md) |
| `rand` | `Randomizer` |

##### Returns

[`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

#### Defined in

[specification.ts:75](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L75)

___

### RANDOM\_SECTION

▸ **RANDOM_SECTION**(`n`, `sections`): (`exam`: [`Exam`](classes/Exam.md), `student`: [`StudentInfo`](interfaces/StudentInfo.md), `rand`: `Randomizer`) => [`Section`](classes/Section.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `n` | `number` |
| `sections` | readonly ([`Section`](classes/Section.md) \| [`SectionSpecification`](modules.md#sectionspecification))[] |

#### Returns

`fn`

▸ (`exam`, `student`, `rand`): [`Section`](classes/Section.md)[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `exam` | [`Exam`](classes/Exam.md) |
| `student` | [`StudentInfo`](interfaces/StudentInfo.md) |
| `rand` | `Randomizer` |

##### Returns

[`Section`](classes/Section.md)[]

#### Defined in

[specification.ts:35](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L35)

___

### RANDOM\_SKIN

▸ **RANDOM_SKIN**(`skins`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `skins` | readonly [`QuestionSkin`](modules.md#questionskin)[] |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `generate` | (`exam`: [`Exam`](classes/Exam.md), `student`: [`StudentInfo`](interfaces/StudentInfo.md), `rand`: `Randomizer`) => readonly [`QuestionSkin`](modules.md#questionskin)[] |
| `getById` | (`id`: `string`) => `undefined` \| [`QuestionSkin`](modules.md#questionskin) |

#### Defined in

[specification.ts:125](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L125)

___

### SINGLE\_REPLACEMENT\_SKINS

▸ **SINGLE_REPLACEMENT_SKINS**(`target`, `replacements`): [`QuestionSkin`](modules.md#questionskin)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `replacements` | readonly `string`[] |

#### Returns

[`QuestionSkin`](modules.md#questionskin)[]

#### Defined in

[skins.ts:26](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/skins.ts#L26)

___

### chooseQuestions

▸ **chooseQuestions**(`chooser`, `exam`, `student`, `rand`): readonly [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `chooser` | [`QuestionSpecification`](modules.md#questionspecification)<[`ResponseKind`](modules.md#responsekind)\> \| [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\> \| [`QuestionChooser`](modules.md#questionchooser) |
| `exam` | [`Exam`](classes/Exam.md) |
| `student` | [`StudentInfo`](interfaces/StudentInfo.md) |
| `rand` | `Randomizer` |

#### Returns

readonly [`Question`](classes/Question.md)<[`ResponseKind`](modules.md#responsekind)\>[]

#### Defined in

[specification.ts:61](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L61)

___

### chooseSections

▸ **chooseSections**(`chooser`, `exam`, `student`, `rand`): readonly [`Section`](classes/Section.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `chooser` | [`Section`](classes/Section.md) \| [`SectionSpecification`](modules.md#sectionspecification) \| [`SectionChooser`](modules.md#sectionchooser) |
| `exam` | [`Exam`](classes/Exam.md) |
| `student` | [`StudentInfo`](interfaces/StudentInfo.md) |
| `rand` | `Randomizer` |

#### Returns

readonly [`Section`](classes/Section.md)[]

#### Defined in

[specification.ts:29](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L29)

___

### fillManifest

▸ **fillManifest**(`manifest`, `submitted`): [`TrustedExamSubmission`](modules.md#trustedexamsubmission)

Fills in the (presumed blank) question responses in the provided manifest
with the student submitted answers for the questions with corresponding IDs.
This should always be used with manifests loaded from the saved manifest files
created on exam generation, since otherwise students could just e.g. change
the question IDs, point values, etc. in their submitted answers file.
This changes the provided manifest object and returns it (casted to a `TrustedExamSubmission`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `manifest` | [`ExamSubmission`](modules.md#examsubmission)<`boolean`\> |
| `submitted` | [`ExamSubmission`](modules.md#examsubmission)<`boolean`\> |

#### Returns

[`TrustedExamSubmission`](modules.md#trustedexamsubmission)

#### Defined in

[submissions.ts:49](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/submissions.ts#L49)

___

### isValidID

▸ **isValidID**(`id`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`boolean`

#### Defined in

[specification.ts:9](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/specification.ts#L9)
