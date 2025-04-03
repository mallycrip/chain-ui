
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { WorkflowNode } from '@/types/workflow';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

const formSchema = z.object({
  name: z.string().min(2, {
    message: '노드 이름은 2자 이상이어야 합니다.',
  }),
  description: z.string().min(2, {
    message: '설명은 2자 이상이어야 합니다.',
  }),
  type: z.enum(['trigger', 'action', 'condition']),
});

interface NodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (node: WorkflowNode) => void;
  workflowId: string;
}

const NodeForm: React.FC<NodeFormProps> = ({ isOpen, onClose, onSubmit, workflowId }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'action',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Get the position for the new node
    // For simplicity, place it at a random position in the canvas
    const newNode: WorkflowNode = {
      id: uuidv4(),
      name: values.name,
      description: values.description,
      type: values.type,
      position: {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 200,
      },
      data: {},
      connections: [],
    };
    
    onSubmit(newNode);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 노드 추가</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>노드 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="노드 이름을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>노드 유형</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="노드 유형 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="trigger">트리거</SelectItem>
                      <SelectItem value="action">액션</SelectItem>
                      <SelectItem value="condition">조건</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="노드에 대한 설명을 입력하세요"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">추가</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NodeForm;
