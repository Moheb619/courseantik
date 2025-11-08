# Dynamic Category Selector

## Overview

The Dynamic Category Selector is a React component that allows users to either select from existing categories or create new categories on-the-fly. This component is designed to be used in forms where category selection is required, such as the course creation form.

## Features

- **Search existing categories**: Users can type to search through existing categories
- **Create new categories**: Users can create new categories directly from the selector
- **Real-time validation**: Prevents duplicate category creation
- **Responsive design**: Works well on both desktop and mobile devices
- **Accessibility**: Keyboard navigation and screen reader support

## Usage

```jsx
import DynamicCategorySelector from "./DynamicCategorySelector";

const MyForm = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  return (
    <DynamicCategorySelector
      selectedCategoryId={selectedCategoryId}
      onCategorySelect={(categoryId) => setSelectedCategoryId(categoryId)}
      error={formErrors.category_id}
      disabled={false}
    />
  );
};
```

## Props

| Prop                 | Type       | Required | Description                                          |
| -------------------- | ---------- | -------- | ---------------------------------------------------- |
| `selectedCategoryId` | `string`   | Yes      | The ID of the currently selected category            |
| `onCategorySelect`   | `function` | Yes      | Callback function called when a category is selected |
| `error`              | `string`   | No       | Error message to display below the selector          |
| `disabled`           | `boolean`  | No       | Whether the selector is disabled (default: false)    |

## How It Works

1. **Category Loading**: The component automatically fetches existing categories from the database using React Query
2. **Search Functionality**: Users can type to filter existing categories
3. **Create New Category**: If no existing category matches the search term, users can create a new one
4. **Real-time Updates**: New categories are immediately available for selection after creation
5. **Error Handling**: Proper error handling for network issues and validation errors

## Database Integration

The component uses the following Supabase operations:

- **Fetch Categories**: `SELECT * FROM categories ORDER BY name`
- **Create Category**: `INSERT INTO categories (name, slug, description) VALUES (...)`

## Styling

The component uses Tailwind CSS classes and follows the existing design system. It includes:

- Hover states for better user experience
- Loading states with spinners
- Error states with red styling
- Success states with green checkmarks
- Responsive design for mobile devices

## Accessibility

- Keyboard navigation support (Arrow keys, Enter, Escape)
- Screen reader friendly with proper ARIA labels
- Focus management for better UX
- High contrast support

## Error Handling

The component handles various error scenarios:

- Network errors when fetching categories
- Validation errors when creating categories
- Duplicate category prevention
- Form validation errors

## Performance

- Uses React Query for efficient data caching
- Debounced search to prevent excessive API calls
- Optimistic updates for better user experience
- Minimal re-renders with proper React patterns

## Example Integration

```jsx
// In CourseForm.jsx
<DynamicCategorySelector
  selectedCategoryId={watch("category_id")}
  onCategorySelect={(categoryId) => {
    setValue("category_id", categoryId);
  }}
  error={errors.category_id?.message}
/>
```

This integration allows users to either select from existing categories like "Web Development", "Mobile Development", etc., or create new categories like "Machine Learning", "Blockchain", etc., directly from the course creation form.
