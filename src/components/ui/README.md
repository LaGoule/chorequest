# ChoreQuest UI Components

This directory contains standardized UI components for the ChoreQuest application.

## Available Components

### AppButton
A standardized button component with various styles and states.

```vue
<AppButton 
  label="Click Me" 
  variant="primary" 
  size="medium"
  icon="add"
  :loading="isLoading"
  @click="handleClick"
/>
```

**Props:**
- `label`: Button text
- `variant`: 'primary', 'secondary', 'success', 'danger', 'outline', 'text'
- `size`: 'small', 'medium', 'large'
- `icon`: Material icon name
- `type`: 'button', 'submit', 'reset'
- `disabled`: Boolean
- `loading`: Boolean

### AppCard
A container with standardized styling.

```vue
<AppCard title="Card Title" :elevation="1">
  Content goes here
  <template v-slot:footer>Footer content</template>
</AppCard>
```

**Props:**
- `title`: Card title
- `elevation`: 0-3 (shadow depth)
- `clickable`: Boolean

### AppForm
A form wrapper with standardized actions.

```vue
<AppForm @submit="handleSubmit" :loading="isSubmitting">
  Form content goes here
</AppForm>
```

**Props:**
- `loading`: Boolean
- `disabled`: Boolean
- `showDefaultActions`: Boolean
- `submitText`: String
- `cancelText`: String
- `showCancelButton`: Boolean

### AppInput
A standardized form input with validation support.

```vue
<AppInput
  v-model="value"
  label="Input Label"
  :error-message="errorMessage"
  @blur="validate"
/>
```

**Props:**
- `modelValue`: String/Number
- `label`: String
- `type`: 'text', 'number', 'email', 'password', etc.
- `placeholder`: String
- `required`: Boolean
- `disabled`: Boolean
- `errorMessage`: String
- `helpText`: String

### AppSelect
A standardized select input with validation support.

```vue
<AppSelect
  v-model="selectedOption"
  :options="options"
  label="Select Option"
  :error-message="errorMessage"
/>
```

**Props:**
- `modelValue`: String/Number
- `options`: Array (simple values or objects)
- `label`: String
- `required`: Boolean
- `disabled`: Boolean
- `errorMessage`: String
- `helpText`: String
- `optionLabel`: String (property name for label if options are objects)
- `optionValue`: String (property name for value if options are objects)

### AppLoading
A loading overlay for async operations.

```vue
<AppLoading :show="isLoading" message="Loading data..." />
```

**Props:**
- `show`: Boolean
- `message`: String

### AppNotifications
A notifications display component (usually mounted globally).

```vue
<AppNotifications />
```

## Usage Guidelines

1. Always use these standard components instead of creating one-off UI elements
2. Maintain consistent styling by leveraging the predefined variants
3. For form fields, use the validation utilities with these components
4. For page layouts, use the AppCard component to maintain visual consistency
